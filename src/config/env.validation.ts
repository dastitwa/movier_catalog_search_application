import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  ELASTICSEARCH_NODE: Joi.string().required(),

  ELASTICSEARCH_SECURITY_ENABLED: Joi.boolean()
    .default(false),

  ELASTICSEARCH_USERNAME: Joi.string()
    .allow('')
    .optional(),

  ELASTICSEARCH_PASSWORD: Joi.string()
    .allow('')
    .optional(),
});