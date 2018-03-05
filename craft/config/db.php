<?php

/**
 * Database Configuration
 *
 * All of your system's database configuration settings go in here.
 * You can see a list of the default settings in craft/app/etc/config/defaults/db.php
 */

// Get environment
require('_env.php');

return array(
    'server'      => '127.0.0.1',
    'user'        => $customEnv['user'],
    'password'    => $customEnv['password'],
    'database'    => $customEnv['database'],
    'tablePrefix' => 'craft',
    'initSQLs' => array("SET SESSION sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';")
);
