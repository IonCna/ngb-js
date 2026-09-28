import { Component, ContentChild, EventEmitter, HostBinding, inject, Input, NgDisabled, type OnChanges, Output, type SimpleChanges } from "ngjs-core";
import {NgbPaginationEllipsis} from "@ngb/pagination/ngb-pagination-ellipsis.directive";
import {NgbPaginationFirst} from "@ngb/pagination/ngb-pagination-first.directive";
import {NgbPaginationLast} from "@ngb/pagination/ngb-pagination-last.directive";
import {NgbPaginationNext} from "@ngb/pagination/ngb-pagination-next.directive";
import {NgbPaginationNumber} from "@ngb/pagination/ngb-pagination-number.directive";
import {NgbPaginationPrevious} from "@ngb/pagination/ngb-pagination-previous.directive";
import {NgbPaginationPages} from "@ngb/pagination/ngb-pagination-pages.directive";
import {getValueInRange, isNumber} from "@ngb/utils";

import {NgbPaginationConfig} from "@ngb/pagination/ngb-pagination-config.service";

export interface NgbPaginationLinkContext {
    currentPage: number;
    disabled: boolean;
}

export interface NgbPaginationNumberContext extends NgbPaginationLinkContext {
    $implicit: number;
}

export interface NgbPaginationPagesContext {
    $implicit: number;
    disabled: boolean;
    pages: number[];
}

@Component({
    selector: "ngb-pagination",
    template: `<ng-template ng-ref="first">
    <span aria-hidden="true" i18n="@@ngb.pagination.first">&laquo;&laquo;</span>
</ng-template>

<ng-template ng-ref="previous">
    <span aria-hidden="true" i18n="@@ngb.pagination.previous">&laquo;</span>
</ng-template>

<ng-template ng-ref="next">
    <span aria-hidden="true" i18n="@@ngb.pagination.next">&raquo;</span>
</ng-template>

<ng-template ng-ref="last">
    <span aria-hidden="true" i18n="@@ngb.pagination.last">&raquo;&raquo;</span>
</ng-template>

<ng-template ng-ref="ellipsis">...</ng-template>

<ng-template ng-ref="defaultNumber" let-page let-currentPage="currentPage">
    {{ page }}
</ng-template>

<ul class="pagination" ng-class="$.size ? 'pagination-' + $.size : null">
    <li ng-if="$.boundaryLinks" class="page-item" ng-class="{ 'disabled': $.previousDisabled() }">
        <a
                aria-label="First"
                i18n-aria-label="@@ngb.pagination.first-aria"
                class="page-link"
                href
                ng-click="$.selectPage(1); $event.preventDefault()"
                ng-attr-tabindex="{{ $.previousDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.previousDisabled() ? 'true' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplFirst && $.tplFirst.templateRef) || first"
                    ng-template-outlet-context="{ disabled: $.previousDisabled(), currentPage: $.page }">
            </ng-template>
        </a>
    </li>

    <li ng-if="$.directionLinks" class="page-item" ng-class="{ 'disabled': $.previousDisabled() }">
        <a
                aria-label="Previous"
                i18n-aria-label="@@ngb.pagination.previous-aria"
                class="page-link"
                href
                ng-click="$.selectPage($.page - 1); $event.preventDefault()"
                ng-attr-tabindex="{{ $.previousDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.previousDisabled() ? 'true' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplPrevious && $.tplPrevious.templateRef) || previous"
                    ng-template-outlet-context="{ disabled: $.previousDisabled() }">
            </ng-template>
        </a>
    </li>

    <li
            ng-repeat="pageNumber in ($.tplPages ? [] : $.pages) track by $index"
            class="page-item"
            ng-class="{ 'active': pageNumber === $.page, 'disabled': $.isEllipsis(pageNumber) || $.isDisabled() }">
        <a ng-if="$.isEllipsis(pageNumber)" class="page-link" tabindex="-1" aria-disabled="true">
            <ng-template
                    ng-template-outlet="($.tplEllipsis && $.tplEllipsis.templateRef) || ellipsis"
                    ng-template-outlet-context="{ disabled: true, currentPage: $.page }">
            </ng-template>
        </a>

        <a
                ng-if="!$.isEllipsis(pageNumber)"
                class="page-link"
                href
                ng-click="$.selectPage(pageNumber); $event.preventDefault()"
                ng-attr-tabindex="{{ $.isDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.isDisabled() ? 'true' : undefined }}"
                ng-attr-aria-current="{{ pageNumber === $.page ? 'page' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplNumber && $.tplNumber.templateRef) || defaultNumber"
                    ng-template-outlet-context="{ disabled: $.isDisabled(), $implicit: pageNumber, currentPage: $.page }">
            </ng-template>
        </a>
    </li>

    <ng-template
            ng-if="$.tplPages"
            ng-template-outlet="$.tplPages.templateRef"
            ng-template-outlet-context="{ $implicit: $.page, pages: $.pages, disabled: $.isDisabled() }">
    </ng-template>

    <li ng-if="$.directionLinks" class="page-item" ng-class="{ 'disabled': $.nextDisabled() }">
        <a
                aria-label="Next"
                i18n-aria-label="@@ngb.pagination.next-aria"
                class="page-link"
                href
                ng-click="$.selectPage($.page + 1); $event.preventDefault()"
                ng-attr-tabindex="{{ $.nextDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.nextDisabled() ? 'true' : undefined }}">
            <ng-template
                    ng-template-outlet="($.tplNext && $.tplNext.templateRef) || next"
                    ng-template-outlet-context="{ disabled: $.nextDisabled(), currentPage: $.page }">
            </ng-template>
        </a>
    </li>

    <li ng-if="$.boundaryLinks" class="page-item" ng-class="{ 'disabled': $.nextDisabled() }">
        <a
                aria-label="Last"
                i18n-aria-label="@@ngb.pagination.last-aria"
                class="page-link"
                href
                ng-click="$.selectPage($.pageCount); $event.preventDefault()"
                ng-attr-tabindex="{{ $.nextDisabled() ? '-1' : undefined }}"
                ng-attr-aria-disabled="{{ $.nextDisabled() ? 'true' : undefined }}"
        >
            <ng-template
                    ng-template-outlet="($.tplLast && $.tplLast.templateRef) || last"
                    ng-template-outlet-context="{ disabled: $.nextDisabled(), currentPage: $.page }">
            </ng-template>
        </a>
    </li>
</ul>`,
})
export class NgbPagination implements OnChanges {
    private _config = inject(NgbPaginationConfig);
    private _ngDisabled = inject(NgDisabled, { optional: true });

    public pageCount = 0
    public pages: number[] = []

    @ContentChild(NgbPaginationEllipsis, { static: false })
    tplEllipsis?: NgbPaginationEllipsis

    @ContentChild(NgbPaginationFirst, { static: false })
    tplFirst?: NgbPaginationFirst

    @ContentChild(NgbPaginationLast, { static: false })
    tplLast?: NgbPaginationLast

    @ContentChild(NgbPaginationNext, { static: false })
    tplNext?: NgbPaginationNext

    @ContentChild(NgbPaginationNumber, { static: false })
    tplNumber?: NgbPaginationNumber

    @ContentChild(NgbPaginationPrevious, { static: false })
    tplPrevious?: NgbPaginationPrevious

    @ContentChild(NgbPaginationPages, { static: false })
    tplPages?: NgbPaginationPages

    @Input() boundaryLinks = this._config.boundaryLinks;
    @Input() directionLinks = this._config.directionLinks;
    @Input() ellipses = this._config.ellipses;
    @Input() rotate = this._config.rotate;
    @Input({ required: true }) collectionSize!: number;
    @Input() maxSize = this._config.maxSize;
    @Input() page = 1;
    @Input() pageSize = this._config.pageSize;
    @Output() pageChange = new EventEmitter<number>();
    @Input() size = this._config.size;

    @HostBinding("attr.role") readonly _role = "navigation";

    /**
     * Si la paginación está deshabilitada. ngb-js: solo por `ng-disabled="expr"` (no hay `@Input() disabled` como
     * upstream: `disabled` es un atributo booleano nativo y choca con el de AngularJS); sin `ng-disabled`, el default
     * de `NgbPaginationConfig`.
     */
    get disabled(): boolean {
        return this._ngDisabled ? this._ngDisabled.disabled : this._config.disabled;
    }

    isDisabled(): boolean {
        return this.disabled;
    }
    
    hasPrevious() {
        return this.page > 1
    }

    hasNext(): boolean {
        return this.page < this.pageCount;
    }

    nextDisabled(): boolean {
        return !this.hasNext() || this.isDisabled();
    }

    previousDisabled(): boolean {
        return !this.hasPrevious() || this.isDisabled();
    }

    selectPage(pageNumber: number): void {
        if (this.isDisabled()) return;
        this._updatePages(pageNumber);
    }

    ngOnChanges(_changes: SimpleChanges): void {
        this._updatePages(this.page);
    }

    isEllipsis(pageNumber: number): boolean {
        return pageNumber === -1;
    }

    private _applyEllipses(start: number, end: number) {
        if(!this.ellipses) return

        if(start > 0) {
            if(start > 2) this.pages.unshift(-1)
            if(start === 2) this.pages.unshift(2)
            this.pages.unshift(1);
        }

        if(end < this.pageCount) {
            if (end < this.pageCount - 2) this.pages.push(-1)
            if (end === this.pageCount - 2) this.pages.push(this.pageCount - 1);
            this.pages.push(this.pageCount)
        }
    }

    private _applyRotation(): [number, number] {
        let start = 0
        let end = this.pageCount

        const leftOffset = Math.floor((this.maxSize / 2))
        const rightOffset = this.maxSize % 2 == 0 ? leftOffset - 1 : leftOffset

        if(this.page <= leftOffset) {
            end = this.maxSize
        } else if(this.pageCount - this.page < leftOffset) {
            start = this.pageCount - this.maxSize;
        } else {
            start = this.page - leftOffset - 1;
            end = this.page + rightOffset;
        }

        return [start, end]
    }

    private _applyPagination(): [number, number] {
        const page = Math.ceil(this.page / this.maxSize) - 1;
        const start = page * this.maxSize;
        const end = start + this.maxSize;

        return [start, end];
    }

    private _setPageInRange(newPageNo: number) {
        const prevPageNo = this.page
        this.page = getValueInRange(newPageNo, this.pageCount, 1)

        if(this.page != prevPageNo && isNumber(this.collectionSize)) {
            this.pageChange.emit(this.page);
        }
    }

    private _updatePages(newPage: number) {
        this.pageCount = Math.ceil(this.collectionSize / this.pageSize)

        if(!isNumber(this.pageCount)) {
            this.pageCount = 0
        }

        this.pages.length = 0

        for (let index = 1; index <= this.pageCount; index++) {
            this.pages.push(index)
        }

        this._setPageInRange(newPage)

        if(this.maxSize > 0 && this.pageCount > this.maxSize) {
            let start = 0;
            let end = this.pageCount;

            [start, end] = this.rotate ? this._applyRotation() : this._applyPagination()

            const visiblePages = this.pages.slice(start, end);
            this.pages.splice(0, this.pages.length, ...visiblePages);

            this._applyEllipses(start, end)
        }
    }
}
