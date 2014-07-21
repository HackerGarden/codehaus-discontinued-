/** @jsx React.DOM */

function increaseStep(){
	if(data.currentStep != data.steps.length - 1){
		data.currentStep++;
		rerender();
	}
	else {
		alert('lesson complete');
	}
}

function rerender(){
	React.renderComponent(
		<Container data={data} />,
		document.getElementById('container')
	);
	initEditor();
	$('#editor').height($(window).height() - 80);
	$('#editor').width($(window).width() - $('#sidebar').width()- $('#console').width()-50);
}

$( window ).resize(function() {
	$('#editor').height($(window).height() - 80);
	$('#editor').width($(window).width() - $('#sidebar').width()- $('#console').width()-50);
});

function initEditor(){
	var editor = ace.edit("editor");
	editor.setTheme("ace/theme/solarized_dark");
	editor.getSession().setMode("ace/mode/javascript");
	editor.getSession().setUseWorker(false);
	editor.setShowPrintMargin(false);
	editor.setWrapBehavioursEnabled(true);
	editor.setHighlightActiveLine(false);
	editor.setShowFoldWidgets(false);
}

var converter = new Showdown.converter();

var GuideName = React.createClass({
	render: function() {
		return (
			<span className="guide-title">
				{this.props.data.name} by {this.props.data.author}
			</span>
		);
	}
});


var Hint = React.createClass({
	getInitialState: function() {
		return {revealed: false};
	},
	handleClick: function(event) {
		this.setState({revealed: !this.state.revealed});
	},
	render: function() {
		var label = this.state.revealed ? 'Hide Hint' : 'Show Hint';
		var hasHint = this.props.step.hint == "" ? "" : label;
		var hintContents = this.state.revealed ? this.props.step.hint : '';
		return (
			<div className="hint">
				<a onClick={this.handleClick}>
				 {hasHint}
				</a><br/>
				{hintContents}
			</div>
		);
	}
});

var Sidebar = React.createClass({
	render: function() {
		var results = this.props.data.steps;
		var currentStep = this.props.data.steps[this.props.data.currentStep];
		return (
			<div id="sidebar">
				<div>
					<span  className="guideName">
					{this.props.data.name}
					</span>
					<span className="dropdown">
  						<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown">
    						{this.props.data.currentStep+1} / {this.props.data.steps.length}
    						<span className="caret pad-left"></span>
						</button>
						<ul className="dropdown-menu pull-right" role="menu" aria-labelledby="dropdownMenu1">
						{results.map(function(result) {
						    return <li role="presentation" key={result.id}><a role="menuitem" tabindex="-1" href="#">{result.title}</a></li>;
						})}
						</ul>
					</span>
				</div>
				<h2>
					{currentStep.title}
				</h2>
				<p className="step-body">
					{currentStep.body}
				</p>
				<Hint step={currentStep}/>
			</div>
		);
	}
});

var Input = React.createClass({
	render: function() {
		if(this.props.reset)
			ace.edit("editor").setValue(this.props.liveStep.startingCode, 1)
		return (
			<div id="editor">
				{this.props.liveStep.startingCode}
			</div>
		);
	}
});

var Output = React.createClass({
	getInitialState: function() {
		return {output: ""};
	},
	eval: function(){
		var code = ace.edit("editor").getValue();
		var pattern = "console\.log\\(",
		re = new RegExp(pattern, "g");
		code = code.replace(re, "document.body.insertAdjacentHTML('beforeend', ");
		var ifrm  = document.getElementsByTagName('iframe')[0], // your iframe
		iwind = ifrm.contentWindow; 
		iwind.document.body.innerHTML = "";
		iwind.eval( code.toString() );
		x = iwind.document.body.innerHTML.toString();
		return x; // re-evaluate function with eval from iframe
	},
	isMatch: function(output) {
		if(this.props.liveStep.correctOutput == output){
			this.props.callback();
		}
	},
	render: function() {
		if(this.props.render){
			var t = this.eval();
			this.isMatch(t)
		}
		else 
			var t = "";
		return (
			<div id="output">
				<iframe height="0" width="0"></iframe>
				<div id="console" onClick={this.eval}>
					{t != null ? t : ""}
				</div>
			</div>
		);
	}
});

var Alert = React.createClass({
	getInitialState: function(){
		return {toggle: true}
	}, 
	handleClick: function(event){
		increaseStep();
		this.setState({toggle: !this.state.toggle})
	},
	render: function() {
		return (
			<div id="alert2" className={this.state.toggle ? "success" : ""} onClick={this.handleClick}>
				{this.state.toggle ? "success" : ""}
			</div>
		);
	}
});

var Main = React.createClass({
	handleClick: function(event){
		increaseStep();
	},
	getInitialState: function() {
		return {reset: false, render: false};
	},
	resetInput: function() {
		this.setState({reset: true, render: false});
		this.render();
	},
	submitClick: function() {
		this.setState({render: true, reset: false});
		this.render();
	},
	progressToNext: function(){
		console.log(this.state.alert);
		React.renderComponent(
			<Alert type={success.type} />,
			document.getElementById('alert')
		);
	},
	render: function(t) {
		if(!t)
			var t = false;
		return (
			<div id="main">
				<Input reset={this.state.reset} liveStep={this.props.data.steps[this.props.data.currentStep]} />
				<div id="controls">
					<button className="btn-secondary btn" onClick={this.submitClick}>
						Run
					</button>
					<button className="btn btn-primary" onClick={this.resetInput}>
						Reset
					</button>
					<div id="alert">
					</div>
				</div>
				<Output callback={this.progressToNext} render={this.state.render} reset={this.state.reset} liveStep={this.props.data.steps[this.props.data.currentStep]} />
			</div>
		);
	}
});

var Container = React.createClass({
	render: function() {
		return (
			<div className="container-inner">
				<div className="row" id="page">
					<div className="col-md-3">
						<Sidebar data={this.props.data}/>
					</div>
					<div className="col-md-9">
						<Main data={this.props.data}/>
					</div>	
				</div>	
			</div>
		);
	}
});

var success = {
	type: "success"
}

var empty = {
	type: ""
}

var data = {
  	name: "React.js beginners guide",
  	author: "David, Adam and Jacob",
   	steps: [
   		{
   			title: "Create a Component",
   			body: "Step Body",
   			hint: "try rocket science",
   			startingCode: "console.log('')",
   			correctOutput: "",
   			headers: "",
   			id: "1"
   		},
   		{
   			title: "Add x",
   			body: "Step Body",
   			hint: "",
   			startingCode: "",
   			correctOutput: "",
   			headers: "",
   			id: "2"
   		}
   	],
   	currentStep: 0
  };


rerender();
