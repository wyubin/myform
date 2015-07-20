# myform.js
## Introduction
A Compact form generator. Design a good api to insert form elements by json object. A straightforward Css design, so each item can align better by name and input area, also label a necessary mark when the information is needed. Revise Safari's problem that do not block submit when needed information is not filled by a home-made tooltip. Also, revise checkbox and select associated DOM to get their value correctly.

The [Demo][] page

## Requirements
No.

And you need to require css and js of sort_table when you use it in browser.

	<script src="myform.min.js"></script>
	<link rel="stylesheet" type="text/css" href="myform.min.css">

## Usage
### Create a plot
1. set up a html container for table plot.(like a div with a *"simple_form"* id)

		<div id="simple_form"></div>
2. render it by adding a array including json object like below

		form_view = new myform(document.querySelector('#simple_form'));
		form_view.add_inputs([
			{name:input,attr:{name:'your_name',type:'text',size:50,required:'required'}},
			{name:input,attr:{name:'age',type:'number',max:100,min:13,required:'required'}}
		]);

## Change logs
* 0.0.1

	Initiate the project and a base function

[demo]:	http://wyubin.github.io/myform/
