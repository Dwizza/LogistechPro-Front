import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent {
  // ... stats and recentOrders omitted for brevity ...
  stats = [
    {
      title: 'Total Orders',
      value: '2,543',
      change: '+12.5%',
      trend: 'up',
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      color: 'blue'
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+8.2%',
      trend: 'up',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'green'
    },
    {
      title: 'Active Products',
      value: '1,234',
      change: '+3.1%',
      trend: 'up',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'purple'
    },
    {
      title: 'Pending Deliveries',
      value: '89',
      change: '-5.4%',
      trend: 'down',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      color: 'orange'
    }
  ];

  recentOrders = [
    { id: '#12453', customer: 'John Smith', date: '2026-01-14', status: 'Delivered', amount: '$234.50' },
    { id: '#12452', customer: 'Sarah Johnson', date: '2026-01-14', status: 'Processing', amount: '$156.80' },
    { id: '#12451', customer: 'Mike Wilson', date: '2026-01-13', status: 'Shipped', amount: '$389.20' },
    { id: '#12450', customer: 'Emma Davis', date: '2026-01-13', status: 'Pending', amount: '$198.00' },
    { id: '#12449', customer: 'David Brown', date: '2026-01-12', status: 'Delivered', amount: '$567.30' }
  ];

  quickActions = [
    { title: 'New Order', icon: 'M12 4v16m8-8H4', path: '/admin/orders/new' },
    { title: 'Manage Warehouses', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', path: '/admin/warehouses' },
    { title: 'Add Product', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', path: '/admin/products/new' },
    { title: 'Manage Managers', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', path: '/admin/managers/create' }
  ];

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Delivered': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Processing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Shipped': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    };
    return colors[status] || 'bg-white/5 text-white/40 border-white/10';
  }
}
