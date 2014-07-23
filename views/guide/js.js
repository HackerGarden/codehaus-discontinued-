/** @jsx React.DOM */

var starting;

$(window).resize(function() {
	$('#editor').height($(window).height() - 80);
	$('#editor').width($(window).width() - $('#sidebar').width()- $('#console').width()-50);
});


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
	handleClick: function(event){
		console.log(event.nativeEvent.target.id);
		this.props.cb(event.nativeEvent.target.id);
	},
	render: function() {
		var results = this.props.data.steps;
		var currentStep = results[this.props.currentStep];
		return (
			<div id="sidebar">
				<div className="topbar">
					<a href="http://www.code.haus">
						<i className="fa fa-home"></i>
					</a>&nbsp;
					<span  className="guideName" >
					 {this.props.data.name}
					</span>
					<span className="dropdown">
  						<button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown">
    						{parseInt(this.props.currentStep)+1} / {this.props.data.steps.length}
						</button>
						<ul className="dropdown-menu pull-right" role="menu" aria-labelledby="dropdownMenu1" onClick={this.handleClick}>
						{results.map(function(result, i) {
						    return <li role="presentation" key={result.id}><a id={i} role="menuitem" tabIndex="-1" href="#">{result.title}</a></li>;
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

// 	render: function() {
// 		var x = "ace"+this.props.liveStep.id;
// 		if(this.props.reset)
// 			ace.edit(x).setValue(this.props.liveStep.startingCode, 1)
// 		return (
// 			<div className="editor" id={x}>
// 				{this.props.liveStep.startingCode}		
// 			</div>
// 		);
// 	}
// });

var Output = React.createClass({
	render: function(){
		return (
			<div id="output">
				<iframe height="0" width="0"></iframe>
				<div id="console">
					{this.props.output}
				</div>
			</div>
		);
	}
});

var Alert = React.createClass({
	handleClick: function(event){
		if(this.props.progress == "complete")
			this.props.cb();
	},
	render: function() {
		var t = this.props.progress;
		console.log(t);
		return (
			<div id="alert">
				<div id="alert2" className={t} onClick={this.handleClick}>
					{t}
				</div>
			</div>
		);
	}
});

var Main = React.createClass({
	handleClick: function(event){
		increaseStep();
	},
	getInitialState: function() {
		starting = this.props.data.steps[this.props.currentStep].startingCode;
		return {reset: false, render: false};
	},
	resetInput: function() {
		this.setState({reset: true, render: false});
		ace.edit("editor").setValue(this.props.data.steps[this.props.currentStep].startingCode, 1)
	},
	componentDidMount: function() {
		console.log(document.getElementsByTagName('iframe')[0].contentWindow.document.getElementsByTagName('head')[0]).write(this.props.data.headers);
		$('head', document.getElementsByTagName('iframe')[0].contentWindow.document).append(this.props.data.headers);
	},
	submitClick: function() {
		var code = ace.edit("editor").getValue();
		var pattern = "console\.log\\(",
		re = new RegExp(pattern, "g");
		code = code.replace(re, "document.body.insertAdjacentHTML('beforeend', ");
		var ifrm  = document.getElementsByTagName('iframe')[0], // your iframe
		iwind = ifrm.contentWindow;
		iwind.document.body.innerHTML = "";
		iwind.eval(code.toString());
		x = iwind.document.body.innerHTML.toString();

		if(this.props.data.steps[this.props.currentStep].correctOutput == x)
			this.props.progressToNext(true);
		else
			this.props.progressToNext(false);

		this.setState({render: true, reset: false, output: x});

		this.render();
	},
	render: function() {
		return (
			<div id="main">
				<div id="controls">
					<button className="btn-secondary btn" onClick={this.submitClick}>
						Run
					</button>
					<button className="btn btn-primary" onClick={this.resetInput}>
						Reset
					</button>
					<Alert progress={this.props.progress} cb={this.props.cb} />
				</div>
				<Output output={this.state.output}/>
			</div>
		);
	}
});

var Container = React.createClass({
	getInitialState: function(){
		return {currentStep: 0, progress: ""};
	},
	switchToState: function(state){
		this.setState({currentStep: state, progress: ""});
		ace.edit("editor").setValue(this.props.data.steps[state].startingCode, 1)

		this.render();
	},	
	nextState: function(){
		if(this.state.currentStep != this.props.data.steps.length - 1){
			this.setState({currentStep: this.state.currentStep+1, progress: ""});
			ace.edit("editor").setValue(this.props.data.steps[this.state.currentStep+1].startingCode, 1);

			this.render();
		}
		else 
			alert('lesson complete');
	},
	stepSuccess: function(b) {
		if(b)
			this.setState({progress: "complete"});
		if(!b)
			this.setState({progress: "error"});
		this.render();
	},
	render: function() {
		return (
			<div className="container-inner">
				<div className="row" id="page">
					<div className="col-sm-3">
						<Sidebar cb={this.switchToState} data={this.props.data} currentStep={this.state.currentStep}/>
					</div>
					<div className="col-sm-9">
						<Main cb={this.nextState} progress={this.state.progress} progressToNext={this.stepSuccess} data={this.props.data} currentStep={this.state.currentStep}/>
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
  	headers: "<script src='http://code.jquery.com/jquery-2.1.1.min.js'></script>",
  	showDocument: false,
   	steps: [
   		{
   			title: "Create a Com",
   			body: "Step Body",
   			hint: "try rocket science",
   			startingCode: "console.log('')",
   			correctOutput: "",
   			headers: "",
   			id: "0",
   			savedCode: ""
   		},
   		{
   			title: "Add x",
   			body: "Step Body",
   			hint: "",
   			startingCode: "ffsdfd",
   			correctOutput: "",
   			headers: "",
   			id: "1",
   			savedCode: ""
   		},
   		{
   			title: "Add x",
   			body: "Step Body",
   			hint: "",
   			startingCode: "",
   			correctOutput: "",
   			headers: "",
   			id: "2",
   			savedCode: ""
   		}
   	]
};



React.renderComponent(
	<Container data={data} />,
	document.getElementById('container')
);

$('#main').prepend("<div id='editor'></div>");
$('#editor').height($(window).height() - 80);
$('#editor').width($(window).width() - $('#sidebar').width()- $('#console').width()-50);

ace.edit("editor").setValue(starting, 1)

var editor = ace.edit("editor");
editor.setTheme("ace/theme/solarized_dark");
editor.getSession().setMode("ace/mode/javascript");
editor.getSession().setUseWorker(false);
editor.setShowPrintMargin(false);
editor.setWrapBehavioursEnabled(true);
editor.setHighlightActiveLine(false);
editor.setShowFoldWidgets(false);
