import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageInventoryComponent } from './manage-inventory.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('ManageInventoryComponent', () => {
    let component: ManageInventoryComponent;
    let fixture: ComponentFixture<ManageInventoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ManageInventoryComponent, HttpClientTestingModule, ReactiveFormsModule]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ManageInventoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
