module.id='myform';
// general object extend
require('../../lib/stdlib.HTMLElement.js');
require('../../lib/stdlib.HTMLFormElement.js');
require('../../lib/stdlib.Navigator.js');
require('../../lib/stdlib.CSSStyleSheet.js');
var extend = require('util')._extend;
var events_reg = require('../../lib/events_reg.js').events_reg;

/**
* create(new) form view without jquery with simple attr and reset, submit functions.
* @constructs myform_view
* @returns {Object} this myform_view object
*/
var myform = function (dom,args){
	this.doms={body:dom};
	this.args = extend({
		custom_class:'myform',
		events:['change'] // support event type on form
	},args);
	// initial event register
	this.e_reg = new events_reg(dom);
	this.validators = {};
	this.init();
};
exports.myform = myform;
/**
* init process myform_view, submit trigger need pass validate_handler and cb_submit
*/
myform.prototype.init = function(){
	var self= this,tmp;
	this.init_view();
	// function support prepare
	this.args.events.map(function(v){self.e_reg.events[v]={}});
	// init event register, submit init function
	this.e_reg.events.submit = function(e){
		// check browser type and response
		if(navigator.browser_version()[0].toLowerCase() == 'safari'){
			if(e.currentTarget.safari_validity(e)){
				self.submit_callback(e);
			}
		}else{self.submit_callback(e);}
		e.preventDefault();
	};
	// change event
	this.e_reg.events.input = function(e){
		e.currentTarget.validate_handler(e);
	}
	// create self css
	tmp = document.querySelector('head>style[title='+this.args.custom_class+']');
	if(tmp==null){
		tmp = document.createElement('style');
		tmp.setAttribute('title',this.args.custom_class);
		document.querySelector('head').appendChild(tmp);
	}
	this.css = tmp.sheet;
}
/**
* init view constructs, add base form structure and reset and submit function
*/
myform.prototype.init_view = function(){
	var self = this;
	this.doms.body.append_by_array([
		{name:'div',attr:{class:'form_input'}},
		{name:'div',attr:{class:'form_ctrl'},
			child:['reset','submit'].map(function(v){
				return {name:'input',attr:{name:v,type:v}};
			})
		}
	]);
	// ref two div
	['form_input','form_ctrl'].map(function(v){
		self.doms[v] = self.doms.body.querySelector('div.'+v);
	});
	this.doms.body.classList.add('myform');
	this.doms.body.classList.add(this.args.custom_class);
}
/**
* create multiple inputs in form on the fly.
* @param {Array} dom_json - including array of dom info, can including "ctrl","no_label" and "hide" keys
* @returns {Object} this
*/
myform.prototype.add_inputs = function(dom_json){
	var t_dom_j;
	var doms_json = dom_json.map(function(dom_j){
		if(dom_j.no_label){
			t_dom_j = dom_j;
		}else{
			t_dom_j = {name:'div',attr:{class: dom_j.hide ? 'field_hide':'field'},
				child:[dom_j,{name:'label',child:[dom_j.attr.name]}]
			};
		}
		return t_dom_j;
	});
	this.doms.form_input.append_by_array(doms_json);
	// css update
	this.css_update();
	// register event each time
	this.e_reg.register();
	return this;
}
/**
* based on label length and form width to calculate better dimension
* @returns {Object} this
*/
myform.prototype.css_update = function(){
	var a_doms,self=this,max_width={},
		selectors={'label':'div.field>label','element':'div.field>*:nth-child(1)'};
	// count width of label and element
	Object.keys(selectors).map(function(v){
		a_doms = Array.prototype.slice.call(self.doms.body.querySelectorAll(selectors[v]));
		max_width[v] = Math.max.apply(null,a_doms.map(function(v_1){
			return v_1.getBoundingClientRect().width;
		}));
	});
	var form_width = this.doms.body.getBoundingClientRect().width;
	// label width
	this.css.css_update('form.'+this.args.custom_class+' div.field>label',{width:max_width.label});
	// form min-width=label_width+100, max-width=label_width+input_width
	this.css.css_update('form.'+this.args.custom_class,{
		'min-width':max_width.label+100,
		'max-width':max_width.label+max_width.element+30
	});
	// input max-width = form_width-label_width
	this.css.css_update('form.'+this.args.custom_class+' div.field>*:nth-child(1)',{
		'max-width':form_width-max_width.label-40
	});
	return this;
}
/**
* default submit callback
* @param {Object} e - event object of form DOM
*/
myform.prototype.submit_callback = function(e){console.log(e.target.val());};

/**
* enable or disable element of form by boolean or a function to scan each element.
* @param {Object} arg - boolean or function
*/
myform.prototype.element_enable = function(arg){
	var i;
	if(typeof(arg)=='boolean'){
		for(i=0;i<this.doms.body.length;i++){
			this.doms.body[i].disabled = !arg;
		}
	}else if(typeof(arg)=='function'){
		for(i=0;i<this.doms.body.length;i++){
			this.doms.body[i].disabled = !arg(this.doms.body[i]);
		}
	}else{
		console.log('your args is wrong type!!');
	}
};
