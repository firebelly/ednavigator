<?php
/**
 * Ednavpayments plugin for Craft CMS 3.x
 *
 * Stripe checkout for EdNavigator payments.
 *
 * @link      https://firebellydesign.com/
 * @copyright Copyright (c) 2018 Firebelly
 */

namespace firebelly\ednavpayments\migrations;

use firebelly\ednavpayments\Ednavpayments;

use Craft;
use craft\config\DbConfig;
use craft\db\Migration;

/**
 * @author    Firebelly
 * @package   Ednavpayments
 * @since     1.0.0
 */
class Install extends Migration
{
    // Public Properties
    // =========================================================================

    /**
     * @var string The database driver to use
     */
    public $driver;

    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        $this->driver = Craft::$app->getConfig()->getDb()->driver;
        if ($this->createTables()) {
            $this->createIndexes();
            $this->addForeignKeys();
            // Refresh the db schema caches
            Craft::$app->db->schema->refresh();
            $this->insertDefaultData();
        }

        return true;
    }

   /**
     * @inheritdoc
     */
    public function safeDown()
    {
        $this->driver = Craft::$app->getConfig()->getDb()->driver;
        $this->removeTables();

        return true;
    }

    // Protected Methods
    // =========================================================================

    /**
     * @return bool
     */
    protected function createTables()
    {
        $tablesCreated = false;

        $tableSchema = Craft::$app->db->schema->getTableSchema('{{%ednavpayments_payment}}');
        if ($tableSchema === null) {
            $tablesCreated = true;
            $this->createTable(
                '{{%ednavpayments_payment}}',
                [
                    'id'          => $this->primaryKey(),
                    'dateCreated' => $this->dateTime()->notNull(),
                    'dateUpdated' => $this->dateTime()->notNull(),
                    'uid'         => $this->uid(),
                    'siteId'      => $this->integer()->notNull(),
                    'summary'     => $this->string(255)->notNull()->defaultValue(''),
                    'log'         => $this->text()->notNull(),
                ]
            );
        }

        return $tablesCreated;
    }

    /**
     * @return void
     */
    protected function createIndexes()
    {
        $this->createIndex(
            $this->db->getIndexName(
                '{{%ednavpayments_payment}}',
                'summary',
                true
            ),
            '{{%ednavpayments_payment}}',
            true
        );
        // Additional commands depending on the db driver
        switch ($this->driver) {
            case DbConfig::DRIVER_MYSQL:
                break;
            case DbConfig::DRIVER_PGSQL:
                break;
        }
    }

    /**
     * @return void
     */
    protected function addForeignKeys()
    {
        $this->addForeignKey(
            $this->db->getForeignKeyName('{{%ednavpayments_payment}}', 'siteId'),
            '{{%ednavpayments_payment}}',
            'siteId',
            '{{%sites}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    /**
     * @return void
     */
    protected function insertDefaultData()
    {
    }

    /**
     * @return void
     */
    protected function removeTables()
    {
        $this->dropTableIfExists('{{%ednavpayments_payment}}');
    }
}
