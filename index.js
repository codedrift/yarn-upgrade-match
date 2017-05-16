#!/usr/bin/env node

'use strict';

var chalk = require('chalk');
var commander = require('commander');
var fs = require('fs');
var execSync = require('child_process').execSync;
var spawn = require('cross-spawn');
var yesno = require('yesno');

var matchString;
var program = commander
	.arguments('<match>')
	.usage(chalk.green('<match>'))
	.action(function (match) {
		matchString = match;
	})
	.parse(process.argv);

matchDependencies(matchString)

function matchDependencies(match) {
	var packageJson = JSON.parse(fs.readFileSync('package.json'));
	var packages = Object.keys(packageJson.dependencies);
	var matcher = new RegExp(match, 'g');

	var matched = packages.filter(function (name) {
		return name.match(matcher)
	});

	if (!matched || matched.length === 0) {
		console.log(chalk.red('No dependencies matched'));
		return;
	}

	console.log(chalk.bold('The following dependecies will be upgraded to their latest version:\n'));
	matched.forEach(function (item) { console.log(chalk.green(item)); });

	yesno.ask(chalk.bold('\nAre you sure you want to continue? (y/n)'), false, function(ok) {
		if(ok) {
			upgradeDependencies(matched);
			process.exit(0);
		} else {
			console.log("Got it. Nothing happens.");
			process.exit(0);
		}
	});
}

function upgradeDependencies(matched) {
	var cmd = 'npm';
	var args = ['update'];

	if (hasYarn()) {
		cmd = 'yarn';
		args = ['upgrade'];
	}

	var finalArgs = args.concat(matched);
	spawn.sync(cmd, finalArgs, { stdio: 'inherit' });
}

function hasYarn() {
	try {
		execSync('yarn --version', { stdio: 'ignore' });
		return true;
	} catch (e) {
		return false;
	}
}