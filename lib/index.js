var path     = require('path');
var _        = require('lodash');
var Promise  = require('bluebird');
var inquirer = require('inquirer');

var defaultQuestionPath = 'questions';



/**
 * Prompt Interface
 *
 * @param {Skeleton}       skeleton  Skeleton instance
 * @param {Array | String} questions Array of questions.
 *                                   Filename or relative path to questions batch from generator.
 * @param {Object}         options
 *
 * @returns {Prompt}
 */
var Prompt = module.exports = function Prompt( skeleton, questions, options ) {
  this._skeleton  = skeleton;
  this._questions = questions;
  this._options   = options || {};
};

/**
 * Run interface
 *
 * @return {Promise}
 */
Prompt.prototype.run = function() {

  var self     = this;
  var rootPath = this._skeleton.scope('rootPath');
  var questionPath;
  var questions;

  // Load questions from path or file
  if(_.isString(self._questions)) {

    // Absolute path
    if(path.isAbsolute(self._questions)) {
      throw new Error('Absolute path is not allowed. Only relative path from generator are allowed');

    // It's a file, no a relative path
    } else if('.' === path.dirname(self._questions)) {
      questionPath = path.join(rootPath, defaultQuestionPath, self._questions);

    // It's relative
    } else {
      questionPath = path.join(rootPath, self._questions);
    }

    try {
      questions = require(questionPath);
    } catch(e) {
      throw new Error('Imposible locate questions in `' + questionPath + '`')
    }
  }

  // Questions are passed directly
  else if(_.isObject(this._questions)) {
    questions = this._questions;
  }

  // Checks
  if(!_.isArray(questions) && questions.length > 0) {
    throw new Error('Questions must be an array with some questions inside');
  }

  return new Promise(function( resolve ) {

    // TODO prefill
    // TODO prompt testing and
    // TODO Decouple inquirer

    // Launch Inquirer prompt.
    // Read more about Inquirer here: https://github.com/SBoudrias/Inquirer.js/
    inquirer.prompt(questions, function( answers ) {

      // Assign answers to correct place: scope or data
      _.forEach(answers, function (value, name) {

        if (0 === name.indexOf('scope.')) {
          self._skeleton.scope(name.replace('scope.', ''), value);
        } else {
          self._skeleton.data(name.replace('data.', ''), value);
        }

      });

      resolve();

    });

  }).bind(self._skeleton);

};