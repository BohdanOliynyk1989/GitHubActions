# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      hashicorp-learn = "lambda-api-nestjs"
    }
  }

}
resource "aws_dynamodb_table" "users" {
  name         = "users-dev"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
}

resource "null_resource" "lambda_dependencies" {
  triggers = {
    always_trigger = timestamp()
  }

  provisioner "local-exec" {
    working_dir = "${path.module}/dependency-layer"
    command     = "npm install && mkdir -p nodejs && ls && cp -r node_modules nodejs/"
  }
}

data "null_data_source" "wait_for_lambda_exporter" {
  inputs = {
    lambda_dependency_id = "${null_resource.lambda_dependencies.id}"
    source_dir           = "${path.module}/"
  }
}

resource "aws_lambda_layer_version" "example_common_node_modules" {
  filename = data.archive_file.lambda_bundle.output_path
  layer_name = "test-dependency-layer"

  compatible_runtimes = ["nodejs20.x"]
}

data "archive_file" "lambda_bundle" {
  type = "zip"

  source_dir = "${path.module}/dependency-layer"
  output_path = "${path.module}/lambda-archive/dependency-layer.zip"

  depends_on = [ null_resource.lambda_dependencies ]
}

data "archive_file" "lambda_users" {
  type = "zip"

  source_dir  = "${path.module}/apps/users/dist/users/src"
  output_path = "${path.module}/apps/users/dist/users/users.zip"
}

resource "aws_s3_object" "lambda_bundle" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "dependency-layer.zip"
  source = data.archive_file.lambda_bundle.output_path

  etag = filemd5(data.archive_file.lambda_bundle.output_path)
}

resource "aws_lambda_function" "get_user" {
  function_name = "get_user"
  handler       = "dist/users/src/main.getUsers"
  runtime       = "nodejs20.x"
  role          = aws_iam_role.lambda_exec.arn

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_bundle.key

  source_code_hash = data.archive_file.lambda_bundle.output_base64sha256

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.users.name
    }
  }
}

resource "aws_cloudwatch_log_group" "users" {
  name = "/aws/lambda/${aws_lambda_function.get_user.function_name}"

  retention_in_days = 30
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda_users"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_policy_users" {
  name = "lambda_policy_users"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ],
        Resource = "${aws_dynamodb_table.users.arn}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_apigatewayv2_api" "lambda" {
  name          = "serverless_lambda_users_gw"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "lambda" {
  api_id = aws_apigatewayv2_api.lambda.id

  name        = "serverless_lambda_users_stage"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_integration" "get_user" {
  api_id = aws_apigatewayv2_api.lambda.id

  integration_uri    = aws_lambda_function.get_user.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_user" {
  api_id = aws_apigatewayv2_api.lambda.id

  route_key = "GET /get_user/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.get_user.id}"
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.lambda.name}"

  retention_in_days = 30
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_user.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}

resource "random_pet" "lambda_bucket_name" {
  prefix = "users"
  length = 4
}

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = random_pet.lambda_bucket_name.id
}

resource "aws_s3_bucket_ownership_controls" "lambda_bucket" {
  bucket = aws_s3_bucket.lambda_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "lambda_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.lambda_bucket]

  bucket = aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}
