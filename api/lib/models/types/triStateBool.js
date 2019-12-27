// values: ['Y', 'N', 'U']
const triStateBoolType = {
  values: {
    y: () => {
      return 'Y'
    },
    n: () => {
      return 'N'
    },
    undefined: () => {
      return 'U'
    },
    _all: () => {
      return [this.values.y, this.values.n, this.values.undefined]
    }
  }
};

module.exports = triStateBoolType
