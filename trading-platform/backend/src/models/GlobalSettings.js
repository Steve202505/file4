'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class GlobalSettings extends Model {
        static getSettings() {
            return this.findOne().then(settings => {
                if (!settings) return this.create({});
                return settings;
            });
        }
    }

    GlobalSettings.init({
        id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        globalSupportMessage: {
            type: DataTypes.TEXT,
            defaultValue: ''
        }
    }, {
        sequelize,
        modelName: 'GlobalSettings',
        tableName: 'global_settings',
        underscored: true
    });

    return GlobalSettings;
};
