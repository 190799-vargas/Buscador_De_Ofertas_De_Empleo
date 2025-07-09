// server/models/jobApplicationModel.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./userModel');
const Job = require('./jobModel');

const JobApplication = sequelize.define('JobApplication', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id',
        },
        allowNull: false,
    },
    jobId: {
        type: DataTypes.UUID,
        references: {
            model: Job,
            key: 'id',
        },
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'accepted', 'rejected'),
        defaultValue: 'pending'
    },
    applicationDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'job_applications',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'jobId']
        }
    ]
});

// Definición de asociaciones
User.hasMany(JobApplication, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});

JobApplication.belongsTo(User, {
    foreignKey: 'userId'
});

Job.hasMany(JobApplication, {
    foreignKey: 'jobId',
    onDelete: 'CASCADE'
});

JobApplication.belongsTo(Job, {
    foreignKey: 'jobId'
});

module.exports = JobApplication;