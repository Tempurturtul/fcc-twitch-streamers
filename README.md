# Twitch Streamers - Angular Refactor

This is an incomplete but mostly functional AngularJS refactor.  A basic mockup of the end-product may be viewed in the `docs/` directory.  A testing framework using Karma, Mocha, and PhantomJS is present but not utilized.

The build instructions for Vagrant sometimes require troubleshooting and are therefore not recommended.

## Prerequisites
[Node.js](https://nodejs.org/) and
[Gulp](http://gulpjs.com/)

**OR**

[Vagrant](https://www.vagrantup.com/)

## Build Instructions
**Without Vagrant** *(recommended)*
- Download repository and checkout this branch.
  - `git checkout angular-refactor`
- Install npm packages.
  - `npm install`
- Run default gulp task.
  - `gulp`
- View project on [port 3000](http://localhost:3000/).

**With Vagrant**
- Download repository and checkout this branch.
  - `git checkout angular-refactor`
- Start virtual machine.
  - `vagrant up`
- SSH into virtual machine.
  - `vagrant ssh`
- Run default gulp task.
  - `gulp`
- View project on [port 3000](http://localhost:3000/).
