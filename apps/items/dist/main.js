"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const items_module_1 = require("./items.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(items_module_1.ItemsModule);
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map