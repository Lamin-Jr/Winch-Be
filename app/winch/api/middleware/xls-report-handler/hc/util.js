exports.loadDmsInstance = (context) => {
  if (!context.in.fileTemplate) {
    const error = new Error('missing file template source information, fix it!');
    error.status = 500;
    throw error;
  } else if (context.in.fileTemplate.channel !== 'storage') {
    const error = new Error(`unsupported channel ${context.in.fileTemplate.channel} for template source, fix it!`);
    error.status = 500;
    throw error;
  } else if (!context.in.fileTemplate.address) {
    const error = new Error('missing address field within file template source information, fix it!');
    error.status = 500;
    throw error;
  } else if (!context.in.fileTemplate.address.startsWith('winch://dms/')) {
    const error = new Error(`unsupported channel ${context.in.fileTemplate.address} for template source, fix it!`);
    error.status = 500;
    throw error;
  }
  const dmsInstance = require("../../dms")
    .getInstance(context.in.fileTemplate.address.substring('winch://dms/'.length));
  if (!dmsInstance) {
    const error = new Error(`unsupported template source, fix it!`);
    error.status = 500;
    throw error;
  }

  return dmsInstance;
};