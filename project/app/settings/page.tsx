'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, Database, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav title="Settings" />
        
        {/* Settings Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">
                  Manage your account preferences and system configuration
                </p>
              </div>
            </div>
            
            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Account Settings */}
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Account Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Manage your profile information and account preferences.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Profile Information</li>
                    <li>• Password & Security</li>
                    <li>• Email Preferences</li>
                    <li>• Account Deletion</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Configure how and when you receive notifications.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Email Notifications</li>
                    <li>• Push Notifications</li>
                    <li>• Report Alerts</li>
                    <li>• System Updates</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <span>Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Manage security settings and access controls.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Two-Factor Authentication</li>
                    <li>• Session Management</li>
                    <li>• API Keys</li>
                    <li>• Access Logs</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Data Settings */}
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    <span>Data Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Control data retention and export settings.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Data Retention Policy</li>
                    <li>• Export Settings</li>
                    <li>• Backup Configuration</li>
                    <li>• Data Privacy</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Appearance Settings */}
              <Card className="hover:shadow-lg transition-shadow duration-200 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-amber-600" />
                    <span>Appearance & Display</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Customize the look and feel of your dashboard.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Theme Selection</li>
                      <li>• Color Scheme</li>
                      <li>• Font Size</li>
                    </ul>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Dashboard Layout</li>
                      <li>• Chart Preferences</li>
                      <li>• Language Settings</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coming Soon Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Settings Configuration Coming Soon
                  </h3>
                  <p className="text-blue-700">
                    Detailed settings configuration panels are currently under development. 
                    This page will be updated with interactive controls for all the settings listed above.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}