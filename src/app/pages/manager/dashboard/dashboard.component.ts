import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class ManagerDashboardComponent {
  stats = [
    {
      title: 'Active Shipments',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'blue'
    },
    {
      title: 'Low Stock Items',
      value: '12',
      change: '-2',
      trend: 'down',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      color: 'orange'
    },
    {
      title: 'Deliveries Today',
      value: '15',
      change: '+2',
      trend: 'up',
      icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'green'
    },
    {
      title: 'Warehouse Capacity',
      value: '84%',
      change: '+1.5%',
      trend: 'up',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      color: 'purple'
    }
  ];

  recentShipments = [
    { id: 'SHP-001', destination: 'Casablanca Port', date: '2026-01-15', status: 'In Transit', driver: 'Ahmed' },
    { id: 'SHP-002', destination: 'Tangier Med', date: '2026-01-15', status: 'Loading', driver: 'Karim' },
    { id: 'SHP-003', destination: 'Rabat Warehouse', date: '2026-01-14', status: 'Delivered', driver: 'Omar' },
    { id: 'SHP-004', destination: 'Marrakech DC', date: '2026-01-14', status: 'Pending', driver: 'Yassine' },
  ];

  inventoryAlerts = [
    { item: 'Standard Pallets', status: 'Critical', stock: '15' },
    { item: 'Forklift Fuel', status: 'Low', stock: '20%' },
    { item: 'Packaging Tape', status: 'Reorder', stock: '50 units' },
  ];

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Delivered': 'bg-green-100 text-green-800',
      'In Transit': 'bg-blue-100 text-blue-800',
      'Loading': 'bg-yellow-100 text-yellow-800',
      'Pending': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}
