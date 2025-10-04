const mongoose = require('mongoose');
const AdminContent = require('../models/AdminContent');
const Experiment = require('../models/Experiment');

// Buffers for offline operations
const buffers = {
  adminContent: [], // { op: 'create'|'update'|'delete', payload }
  experiments: []
};

function isDBConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

async function flushAdminBuffer() {
  for (const item of buffers.adminContent) {
    try {
      if (item.op === 'create') {
        const exists = await AdminContent.findOne({ keyword: item.payload.keyword });
        if (!exists) {
          await AdminContent.create(item.payload);
        }
      } else if (item.op === 'update') {
        await AdminContent.findByIdAndUpdate(item.id, item.payload, { new: false });
      } else if (item.op === 'delete') {
        await AdminContent.findByIdAndDelete(item.id);
      }
    } catch (e) {
      console.error('Offline sync (admin) failed op, will keep in buffer:', e.message);
      return; // stop on first failure to retry later
    }
  }
  buffers.adminContent = [];
}

async function flushExperimentBuffer() {
  for (const item of buffers.experiments) {
    try {
      if (item.op === 'create') {
        await Experiment.create(item.payload);
      } else if (item.op === 'update') {
        await Experiment.findByIdAndUpdate(item.id, item.payload, { new: false });
      } else if (item.op === 'delete') {
        await Experiment.findByIdAndDelete(item.id);
      }
    } catch (e) {
      console.error('Offline sync (experiments) failed op, will keep in buffer:', e.message);
      return;
    }
  }
  buffers.experiments = [];
}

async function flushAll() {
  if (!isDBConnected()) return;
  await flushAdminBuffer();
  await flushExperimentBuffer();
}

// Hook to run when DB becomes connected
mongoose.connection.on('connected', () => {
  console.log('🔄 Mongo connected – attempting to flush offline buffers...');
  flushAll().then(() => console.log('✅ Offline buffers flushed')).catch(err => console.error('❌ Flush failed:', err.message));
});

module.exports = {
  buffers,
  isDBConnected,
  flushAll
};
