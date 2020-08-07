module.exports = {
  binds: [
    {
      text: 'Workspace',
      value: 'workspace',
      cats: [
        { text: 'Risk Assessment', value: 'risk-ass', required: true },
        { text: 'Local Health and Safety Manual', value: 'manual', required: true },
        { text: 'Quiz', value: 'quiz' },
        { text: 'Induction', value: 'induct' },
        { text: 'Other', value: 'other' },
      ],
    },
    {
      text: 'Task/Process',
      value: 'task',
      cats: [
        { text: 'Risk Assessment', value: 'risk-ass' },
        { text: 'Method Statement', value: 'meth-state' },
        { text: 'Other', value: 'other' },
      ],
    },
    {
      text: 'Tool/Equipment',
      value: 'tool',
      cats: [
        { text: 'Risk Assessment', value: 'risk-ass', required: true },
        { text: 'Standard Operating Procedure', value: 'sop', required: true },
        { text: 'Operation Manual', value: 'manual', required: true },
        { text: 'Quiz', value: 'quiz' },
        { text: 'Induction', value: 'induct' },
        { text: 'Other', value: 'other' },
      ],
    },
  ],
};

