from fabric.api import *
import os

env.hosts = ['ednavigator.firebelly.co']
env.user = 'firebelly'

env.path = '/Users/developer/Sites/ednavigator'
env.remotepath = '/home/firebelly/apps/ednavigator'
env.git_branch = 'master'
env.warn_only = True

def staging():
  env.hosts = ['staging.ednavigator.com']
  env.user = 'deployer'
  env.git_branch = '2019-updates'
  env.remotepath = '/var/www/ednavigator-staging'

def production():
  env.hosts = ['www.ednavigator.com']
  env.user = 'deployer'
  env.remotepath = '/var/www/ednavigator'

def testing():
  env.git_branch = '2019-updates'

def deploy(composer='y', assets='y'):
  update()
  if composer == 'y':
    composer_install()
  # build and sync production assets
  if assets != 'n':
    local('yarn build:production')
    run('mkdir -p ' + env.remotepath + '/web/assets/dist')
    put('web/assets/dist', env.remotepath + '/web/assets/')

def update():
  with cd(env.remotepath):
    run('git pull origin {0}'.format(env.git_branch))

def composer_install():
  with cd(env.remotepath):
    run('/usr/bin/composer install')
