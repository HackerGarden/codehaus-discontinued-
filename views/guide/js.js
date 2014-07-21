/** @jsx React.DOM */

function increaseStep(){
	data.currentStep++;
	rerender();
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
		var currentStep = this.props.data.steps[this.props.data.currentStep];
		return (
			<div id="sidebar">
				<em>
					Step {this.props.data.currentStep+1} / {this.props.data.steps.length} of {this.props.data.name}
				</em>
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
		return (
			<div id="editor">
				{this.props.reset ? "GOOD" : "BAD"}
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
		console.log(code);
		var ifrm  = document.getElementsByTagName('iframe')[0], // your iframe
		iwind = ifrm.contentWindow; 
		iwind.document.body.innerHTML = "";
		iwind.eval( code.toString() );
		x = iwind.document.body.innerHTML.toString();
		this.setState({output: x});              // re-evaluate function with eval from iframe
	},
	render: function() {
		if(this.props.render)
			this.eval()
		return (
			<div id="output">
				<iframe height="0" width="0"></iframe>
				<div id="console" onClick={this.eval}>
					{this.state.output}
				</div>
			</div>
		);
	}
});

var Alert = React.createClass({
	getInitialState: function() {
		return {message: ""};
	},
	throwError: function(){
		this.setState({message: "error"});
	},
	throwSuccess: function(){
		this.setState({message: "success"});
	},
	handleClick: function(event){
		if(this.state.message == "success"){
			increaseStep();
		}
	},
	render: function() {
		return (
			<div id="alert" className={this.state.message} onClick={this.handleClick}>
				{this.state.message}
			</div>
		);
	}
});

var Main = React.createClass({
	getInitialState: function() {
		return {reset: false, render: false};
	},
	resetInput: function() {
		this.setState({reset: true});
	},
	submitClick: function() {
		this.setState({render: true});
		this.render();
	},
	render: function() {
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
					<Alert />
				</div>	
				<Output render={this.state.render}/>
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

var data = {
  	name: "React.js beginners guide",
  	author: "David, Adam and Jacob",
   	steps: [
   		{
   			title: "Create a Component",
   			body: "Step Body",
   			hint: "try rocket science",
   			startingCode: "var Button = React.createClass({\n 	render: function(){\n 		return (<button>Test</button>);\n 	}\n});",
   			correctOutput: "",
   			headers: ""
   		},
   		{
   			title: "Add x",
   			body: "Step Body",
   			hint: "",
   			startingCode: "",
   			correctOutput: "",
   			headers: ""
   		}
   	],
   	currentStep: 0
  };


rerender();