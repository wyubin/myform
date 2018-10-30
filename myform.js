"use strict"
module.id='myform';
// general object extend
require('jsStdlib/stdlib.HTMLElement.js');
require('jsStdlib/stdlib.HTMLFormElement.js');
require('jsStdlib/stdlib.Navigator.js');
require('jsStdlib/stdlib.CSSStyleSheet.js');
require('jsStdlib/stdlib.FileList.js');
var extend = require('util')._extend;
var events_reg = require('spa_tools/events_reg.js');

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
	this.files = {};
	this.init();
};
module.exports = myform;
/**
* init process myform_view, submit trigger need pass validate_handler and cb_submit
*/
myform.prototype.init = function(){
	var self= this;
	this.init_view();
	// function support prepare
	this.args.events.map(function(v){self.e_reg.events[v]={}});
	// init event register, submit init function
	this.e_reg.events.submit = function(e){
		e.preventDefault();
		// check browser type and response
		if(navigator.browser_version()[0].toLowerCase() == 'safari'){
			if(e.currentTarget.safari_validity(e)){
				self.submit_callback(e);
			}
		}else{self.submit_callback(e);}
	};
	// input event
	this.e_reg.events.input = function(e){
		e.currentTarget.validate_handler(e);
	}
	/* input file change to preload, single file
	var f_r = new FileReader(),f_n;
	f_r.onload = function(e){self.files[f_n] = e.target.result;}
	this.e_reg.events.change['input[type=file]'] = function(e){
		var t_dom = e.target;
		f_n = t_dom.name;
		if(t_dom.files.length){
			f_r.readAsDataURL(t_dom.files[0]);
		}else{
			self.files[f_n] = '';
		}
	}*/
	// input file change to preload, multiple files
	this.e_reg.events.change['input[type=file]'] = function(e){
		e.target.files.readPromise().then(function(data){
			self.files[e.target.name] = data;
		});
	}
	// create self css if null
	if(!this.args.css){
		var t_dom = document.createElement('style');
		document.head.appendChild(t_dom);
		this.args.css = t_dom.sheet;
	}
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
				return {name:'input',attr:{type:v}};
			})
		}
	]);
	// ref two div
	['form_input','form_ctrl'].map(function(v){
		self.doms[v] = self.doms.body.querySelector('div.'+v);
	});
	// add classes
	'myform hide'.split(/\s+/).concat([this.args.custom_class]).map(function(v){
		self.doms.body.classList.add(v);
	});
}
/**
* create multiple inputs in form on the fly.
* @param {Array} dom_json - including array of dom info, can including "ctrl","no_label" and "hide" keys
* @returns {Object} this
*/
myform.prototype.add_inputs = function(dom_json){
	var t_dom_j,t_label,hide_inds=[];
	var doms_json = dom_json.map(function(dom_j,ind){
		t_label=dom_j.label || dom_j.attr.name;
		if(dom_j.no_label || !t_label){
			t_dom_j = dom_j;
		}else{
			t_dom_j = {name:'div',attr:{class:'field'},
				child:[dom_j,{name:'label',child:[t_label]}]
			};
		}
		if(dom_j.hide){
			hide_inds.push(ind);
		}
		return t_dom_j;
	});
	var self = this;
	this.doms.form_input.append_by_array(doms_json);
	// display now
	this.doms.body.classList.remove('hide');
	// css update
	this.css_update();
	// register event each time
	this.e_reg.register();
	// hide fields
	hide_inds.map(function(v){
		self.doms.form_input.children[v].classList.add('hide');
	});
	return this;
}
/**
* based on label length and form width to calculate better dimension
* @returns {Object} this
*/
myform.prototype.css_update = function(){
	var a_doms,self=this,max_width={},
		selectors={'label':'div.field>label','element':'div.field>*:nth-child(1)'};
	// remove previuos css
	this.args.css.clean([' div.field > label','',' div.field > :nth-child(1)'].map(function(v){
		return 'form.'+self.args.custom_class+v;
	}));
	// count width of label and element
	Object.keys(selectors).map(function(v){
		a_doms = Array.prototype.slice.call(self.doms.body.querySelectorAll(selectors[v]));
		max_width[v] = Math.max.apply(null,a_doms.map(function(v_1){
			return v_1.getBoundingClientRect().width;
		}));
	});
	// label width
	this.args.css.css_update('form.'+this.args.custom_class+' div.field > label',{width:max_width.label+'px'});
	// form min-width=label_width+100, max-width=label_width+input_width
	this.args.css.css_update('form.'+this.args.custom_class,{
		'max-width':'calc('+(max_width.label+max_width.element)+'px + 2em)'
	});
	var form_width = this.doms.body.getBoundingClientRect().width;
	// input max-width = form_width-label_width
	this.args.css.css_update('form.'+this.args.custom_class+' div.field > :nth-child(1)',{
		'max-width':'calc('+(form_width-max_width.label)+'px - 4em)'
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
