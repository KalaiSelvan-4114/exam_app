const Joi = require('joi');

exports.validatePreferences = (preferences) => {
  const schema = Joi.object({
    autoAssignStaff: Joi.boolean().required(),
    notifyOnChanges: Joi.boolean().required(),
    allowOverlap: Joi.boolean().required(),
    requireApproval: Joi.boolean().required(),
    defaultDuration: Joi.number().min(30).max(240).required(),
    maxStudentsPerHall: Joi.number().min(10).max(200).required(),
  });

  return schema.validate(preferences);
}; 