const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Token = require('../models/token');

const checkAuth = require('../middleware/check-auth');

router.get('/', checkAuth, (req, res, next) => {
  Token.find({}).exec()
    .then(readAllResult => {
      if (readAllResult) {
        res.status(200).json({
          status: 200,
          total: readAllResult.length,
          skip: 0,
          limit: 0,
          set: readAllResult
        });
      } else {
        res.status(404).json({
          status: 404,
          total: 0,
          skip: 0,
          limit: 0,
          set: []
        });
      }
    })
    .catch(readAllError => {
      res.status(500).json({
        status: 500,
        _debug: readAllError
      });
    });

  // res.status(501).json({
  //   status: 200,
  //   message: 'get all not implemented yet'
  // });
});

router.post('/', (req, res, next) => {
  const token = new Token({
    _id: new mongoose.Types.ObjectId(),
    type: 'bearer'
  });
  token.save()
    .then(createResult => {
      res.status(201).json({
        status: 201,
        _debug: createResult
      });
    })
    .catch(createError => {
      res.status(500).json({
        status: 500,
        _debug: createError
      });
    });

    // res.status(501).json({
    //   status: 201,
    //   message: 'create not implemented yet'
    // });
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  Token.findById(id).exec()
    .then(readResult => {
      if (readResult) {
        res.status(200).json({
          status: 200,
          total: 1,
          skip: 0,
          limit: 0,
          set: [ readResult ]
        });
      } else {
        res.status(404).json({
          status: 404,
          total: 0,
          skip: 0,
          limit: 0,
          set: []
        });
      }
    })
    .catch(readError => {
      res.status(500).json({
        status: 500,
        _debug: readError
      });
    });

  // res.status(501).json({
  //   status: 200,
  //   message: 'get by \'' + id + '\' not implemented yet'
  // });
});

router.patch('/:id', (req, res, next) => {
  const id = req.params.id;

  const updateStatements = {};
  for (const inputUpdateStatement in req.body) {
    updateStatements[inputUpdateStatement.propName] = inputUpdateStatement.value;
  }

  Token.update({ _id: id }, { $set: updateStatements }).exec()
    .then(updateResult => {
      res.status(200).json({
        status: 200,
        total: 1,
        skip: 0,
        limit: 0,
        set: [ { _id: id } ],
        _debug: updateResult
      });
    })
    .catch();

  // res.status(501).json({
  //   status: 501,
  //   message: 'update by \'' + id + '\' not implemented yet'
  // });
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  Token.remove({ _id: id }).exec()
    .then(deleteResult => {
      res.status(200).json({
        status: 200,
        total: 1,
        skip: 0,
        limit: 0,
        set: [ { _id: id } ],
        _debug: deleteResult
      });
    })
    .catch(deleteError => {
      res.status(500).json({
        status: 500,
        _debug: deleteError
      });
    });

  // res.status(501).json({
  //   status: 501,
  //   message: 'delete by \'' + id + '\' not implemented yet'
  // });
});

module.exports = router;
