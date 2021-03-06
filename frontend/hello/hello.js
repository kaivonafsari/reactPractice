var React = require("react")
  , helloJade = require('./hello.jade')
  , pellet = require("pellet");

module.exports = helloPage = pellet.createClass({
  /*
  componentConstruction: function(options, next) {
    this.set({val:'val'}); // serialized to the broswer from the server render
    this.setProps({val:'val'}); // set props passed to getInitialState

    next();
  },
  getInitialState: function() {
    return {};
  },
  componentWillMount: function() {
  },
  componentDidMount: function(nextProps) {
  },
  componentWillReceiveProps: function(nextProps) {
  },
  shouldComponentUpdate: function(nextProps, nextState) {
  },
  componentWillUpdate: function(nextProps, nextState) {
  },
  componentDidUpdate: function(prevProps, prevState) {
  },
  componentWillUnmount: function(nextProps, nextState) {
  },
  */

  getInitialState: function() {
    return {
      count: 0
    };
  },

  add: function(){
    this.setState({count: this.state.count+1});
  },

  layoutTemplate: "layout1",
  
  routes: "/hello/:name",
  

  render: function() {
    return helloJade(this);
  }
});
