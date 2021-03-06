var React = require("react")
  , layout1Jade = require('./layout1.jade')
  , pellet = require("pellet");

module.exports = layout1Layout = pellet.createClass({
  componentConstruction: function(options, next) {

    // if the layout does not have state you skip
    // creating the namespace
    var ns = this.namespace("content")
    ns.setProps({
        originalUrl: this.props.originalUrl,
        params: this.props.params,
        query: this.props.query,
        url: this.props.url
    });

    this.setProps({
      layoutContent: this.props.__layoutContent
    });

    // now forward the layout main context's component construction data
    ns.addChildComponent(false, this.props.__layoutContent, options, next);
  },

  /*
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

  render: function() {
    this.layoutContent = React.createElement(this.props.layoutContent, this.props.content);
    return layout1Jade(this);
  }
});
