"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOperation = void 0;
const Joi = require("joi");
const fs = require("fs-extra");
const helpers_1 = require("../helpers");
const BaseInputSchema = Joi.object({
    operation: Joi.string().lowercase().valid("update").required(),
    region: Joi.string().lowercase().required(),
    table: Joi.string().required(),
});
const InputSchema = Joi.alternatives([
    BaseInputSchema.append({
        updateExpression: Joi.string().required(),
        expressionAttributeValues: Joi.string().required(),
        key: Joi.object().required(),
    }),
    BaseInputSchema.append({
        updateExpression: Joi.string().required(),
        expressionAttributeValues: Joi.string().required(),
        file: Joi.string().required(),
    }),
]).required();
class UpdateOperation {
    constructor() {
        this.name = "update";
    }
    async validate(input) {
        const validationResult = InputSchema.validate(input, {
            stripUnknown: true,
        });
        if (validationResult.error) {
            throw validationResult.error;
        }
        return validationResult.value;
    }
    async execute(input) {
        const ddb = helpers_1.createClient(input.region);
        const item = input.key || await this.read(input.file);
        await ddb.update({
            TableName: input.table,
            Key: item,
            UpdateExpression: `set ${input.updateExpression} = :${input.updateExpression}`,
            ExpressionAttributeValues: {
                [`:${input.updateExpression}`]: `${input.expressionAttributeValues}`
            }
        }).promise();
    }
    async read(path) {
        const content = await fs.readFile(path, { encoding: "utf8" });
        return JSON.parse(content);
    }
}
exports.UpdateOperation = UpdateOperation;
