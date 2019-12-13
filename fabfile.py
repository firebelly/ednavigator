from fabric.api import *
import os

env.hosts = ['ednavigator.firebelly.co']
env.user = 'firebelly'

env.path = '/Users/developer/Sites/ednavigator'
env.remotepath = '/home/firebelly/webapps/ednavigator'
env.git_branch = 'master'
env.warn_only = True

def production():
  env.hosts = ['www.ednavigator.com']
  env.user = 'ednavigator'
  env.remotepath = '/home/ednavigator/webapps/ednavigator'

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
    run('~/bin/composer install')