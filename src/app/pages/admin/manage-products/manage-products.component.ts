import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product/product.service';
import { Product, ProductWarehouse, ProductTableItem } from '../../../models/product.model';
import { WarehouseService } from '../../../services/warehouse/warehouse.service';
import { Warehouse } from '../../../models/warehouse.model';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.css'
})
export class ManageProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private warehouseService = inject(WarehouseService);

  allProducts: Product[] = [];
  displayItems: ProductTableItem[] = [];
  warehouses: Warehouse[] = [];
  categories: string[] = [];

  selectedWarehouseId: number | null = null;
  selectedCategory: string = '';
  searchTerm: string = '';
  sortBy: string = 'name';

  loading = false;
  showModal = false;
  showDetailsModal = false;
  editingProduct: Product | null = null;
  selectedProductDetails: Product | null = null;
  errorMsg = '';

  form = this.fb.group({
    sku: ['', [Validators.required]],
    name: ['', [Validators.required]],
    category: ['', [Validators.required]],
    avgPrice: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.reloadData();
    this.loadWarehouses();
  }

  reloadData(): void {
    this.loading = true;
    this.errorMsg = '';
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data;
        const allCats = data.map(p => p.category).filter(c => !!c);
        this.categories = [...new Set(allCats)].sort();
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load products.';
        this.loading = false;
      }
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses = data,
      error: () => console.warn('Warehouses load failed')
    });
  }

  applyFilters(): void {
    let items: ProductTableItem[] = [];

    this.allProducts.forEach(p => {
      if (p.warehouses && p.warehouses.length > 0) {
        p.warehouses.forEach(w => {
          items.push({
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category,
            warehouseName: w.warehouseName,
            warehouseCode: w.warehouseCode,
            warehouseId: w.warehouseId,
            stock: w.qtyOnHand,
            price: w.price,
            imageUrl: p.imageUrl
          });
        });
      } else {
        items.push({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          warehouseName: 'Unassigned',
          warehouseCode: '---',
          stock: 0,
          price: p.avgPrice || 0,
          imageUrl: p.imageUrl
        });
      }
    });

    if (this.selectedWarehouseId) {
      items = items.filter(i => i.warehouseId === this.selectedWarehouseId);
    }
    if (this.selectedCategory) {
      items = items.filter(i => i.category === this.selectedCategory);
    }
    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s));
    }

    items.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'stock-low': return a.stock - b.stock;
        case 'stock-high': return b.stock - a.stock;
        default: return a.name.localeCompare(b.name);
      }
    });

    this.displayItems = items;
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onWarehouseChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedWarehouseId = val ? Number(val) : null;
    this.applyFilters();
  }

  onCategoryChange(event: Event): void {
    this.selectedCategory = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onSortChange(event: Event): void {
    this.sortBy = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedWarehouseId = null;
    this.selectedCategory = '';
    this.sortBy = 'name';
    this.applyFilters();
  }

  openCreateModal(event?: Event): void {
    if (event) event.preventDefault();
    this.editingProduct = null;
    this.form.reset({ avgPrice: 0 });
    this.showModal = true;
  }

  openEditModal(item: ProductTableItem): void {
    const original = this.allProducts.find(p => p.id === item.id);
    if (!original) return;
    this.editingProduct = original;
    this.form.patchValue({
      sku: original.sku,
      name: original.name,
      category: original.category,
      avgPrice: original.avgPrice || item.price
    });
    this.showModal = true;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    const data = {
      ...this.form.value,
      active: true
    } as Partial<Product>;

    const obs = this.editingProduct
      ? this.productService.updateProduct(this.editingProduct.id!, data)
      : this.productService.createProduct(data);

    obs.subscribe({
      next: () => {
        this.reloadData();
        this.showModal = false;
        this.editingProduct = null;
      },
      error: (err) => {
        console.error('Request rejected:', err);
        this.errorMsg = `Operation failed (403). Ensure SKU uniqueness.`;
        this.loading = false;
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Delete this product?')) {
      this.loading = true;
      this.productService.deleteProduct(id).subscribe({
        next: () => this.reloadData(),
        error: () => {
          this.errorMsg = 'Delete failed. Resource locked.';
          this.loading = false;
        }
      });
    }
  }

  viewDetails(id: number): void {
    this.loading = true;
    this.productService.getProductDetails(id).subscribe({
      next: (data) => {
        this.selectedProductDetails = data;
        this.showDetailsModal = true;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load details.';
        this.loading = false;
      }
    });
  }

  closeModals(): void {
    this.showModal = false;
    this.showDetailsModal = false;
    this.editingProduct = null;
    this.selectedProductDetails = null;
    this.form.reset();
  }
}
