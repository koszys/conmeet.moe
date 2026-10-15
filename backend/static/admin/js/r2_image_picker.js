/**
 * Cloudflare R2 Image Picker for Django Admin
 */
(function () {
  'use strict';

  class R2PickerModal {
    constructor() {
      this.modalEl = null;
      this.activeInputId = null;
      this.activeFolder = '';
      this.selectedItem = null;
      this.imagesData = [];
      this.foldersData = [];
      this.isLoading = false;

      this.init();
    }

    init() {
      document.addEventListener('click', (e) => {
        // Open modal button
        const openBtn = e.target.closest('.r2-open-btn');
        if (openBtn) {
          e.preventDefault();
          const inputId = openBtn.getAttribute('data-input-id');
          const folder = openBtn.getAttribute('data-folder') || '';
          this.open(inputId, folder);
          return;
        }

        // Clear selection button in form
        const clearBtn = e.target.closest('.r2-clear-selection-btn');
        if (clearBtn) {
          e.preventDefault();
          const root = clearBtn.closest('.r2-image-picker-root');
          if (root) {
            const inputId = root.getAttribute('data-input-id');
            this.clearSelection(inputId);
          }
        }
      });
    }

    ensureModal() {
      if (this.modalEl) return;

      const html = `
        <div class="r2-modal-overlay" style="display: none;" id="r2_modal_overlay">
          <div class="r2-modal-window">
            <div class="r2-modal-header">
              <h3>Select Image from Cloudflare R2</h3>
              <button type="button" class="r2-modal-close-btn" id="r2_modal_close">&times;</button>
            </div>
            <div class="r2-modal-toolbar">
              <select class="r2-filter-select" id="r2_folder_filter">
                <option value="">All Folders</option>
              </select>
              <input type="text" class="r2-search-input" id="r2_search_input" placeholder="Search images by filename...">
              <span class="r2-count-badge" id="r2_count_badge">0 items</span>
            </div>
            <div class="r2-modal-body" id="r2_modal_body">
              <div class="r2-image-grid" id="r2_image_grid"></div>
            </div>
            <div class="r2-modal-footer">
              <div class="r2-footer-selection-text" id="r2_selection_text">No image selected</div>
              <div class="r2-footer-actions">
                <button type="button" class="r2-btn-cancel" id="r2_modal_cancel">Cancel</button>
                <button type="button" class="r2-btn-use" id="r2_modal_use" disabled>Use Selected Image</button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', html);
      this.modalEl = document.getElementById('r2_modal_overlay');

      // Bind events
      document.getElementById('r2_modal_close').addEventListener('click', () => this.close());
      document.getElementById('r2_modal_cancel').addEventListener('click', () => this.close());
      document
        .getElementById('r2_modal_use')
        .addEventListener('click', () => this.confirmSelection());

      document.getElementById('r2_folder_filter').addEventListener('change', (e) => {
        this.activeFolder = e.target.value;
        this.renderGrid();
      });

      document.getElementById('r2_search_input').addEventListener('input', () => {
        this.renderGrid();
      });

      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) {
          this.close();
        }
      });

      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modalEl && this.modalEl.style.display !== 'none') {
          this.close();
        }
      });
    }

    open(inputId, folder) {
      this.ensureModal();
      this.activeInputId = inputId;
      this.activeFolder = folder;
      this.selectedItem = null;

      const useBtn = document.getElementById('r2_modal_use');
      const selectionText = document.getElementById('r2_selection_text');
      const searchInput = document.getElementById('r2_search_input');
      if (useBtn) useBtn.disabled = true;
      if (selectionText) selectionText.textContent = 'No image selected';
      if (searchInput) searchInput.value = '';

      this.modalEl.style.display = 'flex';
      this.fetchImages();
    }

    close() {
      if (this.modalEl) {
        this.modalEl.style.display = 'none';
      }
    }

    fetchImages() {
      const grid = document.getElementById('r2_image_grid');
      grid.innerHTML = '<div class="r2-modal-loading">Loading Cloudflare R2 images...</div>';

      fetch('/admin/r2-images/')
        .then((resp) => {
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          return resp.json();
        })
        .then((data) => {
          this.imagesData = data.images || [];
          this.foldersData = data.folders || [];
          this.populateFoldersDropdown();
          this.renderGrid();
        })
        .catch((err) => {
          grid.innerHTML = `<div class="r2-modal-empty" style="color: #c62828;">Failed to load images from R2: ${err.message}</div>`;
        });
    }

    populateFoldersDropdown() {
      const select = document.getElementById('r2_folder_filter');
      if (!select) return;

      select.innerHTML = '<option value="">All Folders</option>';
      this.foldersData.forEach((f) => {
        const opt = document.createElement('option');
        opt.value = f;
        opt.textContent = f;
        if (f === this.activeFolder) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
    }

    renderGrid() {
      const grid = document.getElementById('r2_image_grid');
      const countBadge = document.getElementById('r2_count_badge');
      const searchVal = (document.getElementById('r2_search_input').value || '')
        .trim()
        .toLowerCase();
      const folderVal = document.getElementById('r2_folder_filter').value;

      let filtered = this.imagesData;
      if (folderVal) {
        filtered = filtered.filter((img) => img.folder === folderVal);
      }
      if (searchVal) {
        filtered = filtered.filter(
          (img) =>
            img.name.toLowerCase().includes(searchVal) || img.key.toLowerCase().includes(searchVal)
        );
      }

      if (countBadge) {
        countBadge.textContent = `${filtered.length} item${filtered.length === 1 ? '' : 's'}`;
      }

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="r2-modal-empty">No images found matching filter.</div>';
        return;
      }

      grid.innerHTML = '';
      filtered.forEach((img) => {
        const card = document.createElement('div');
        card.className = 'r2-grid-card';
        if (this.selectedItem && this.selectedItem.key === img.key) {
          card.classList.add('r2-selected-card');
        }

        card.innerHTML = `
          <div class="r2-card-thumb-wrap">
            <img class="r2-card-thumb" src="${img.url}" alt="${img.name}" loading="lazy">
          </div>
          <div class="r2-card-meta">
            <span class="r2-card-name" title="${img.name}">${img.name}</span>
            <div class="r2-card-sub">
              <span>${img.folder || 'root'}</span>
              <span>${img.size_display}</span>
            </div>
          </div>
          <div class="r2-selected-check">✓</div>
        `;

        card.addEventListener('click', () => {
          this.selectCard(card, img);
        });

        card.addEventListener('dblclick', () => {
          this.selectCard(card, img);
          this.confirmSelection();
        });

        grid.appendChild(card);
      });
    }

    selectCard(cardEl, img) {
      document
        .querySelectorAll('.r2-grid-card')
        .forEach((c) => c.classList.remove('r2-selected-card'));
      cardEl.classList.add('r2-selected-card');
      this.selectedItem = img;

      const useBtn = document.getElementById('r2_modal_use');
      const selectionText = document.getElementById('r2_selection_text');
      if (useBtn) useBtn.disabled = false;
      if (selectionText) {
        selectionText.textContent = `Selected: ${img.key}`;
      }
    }

    confirmSelection() {
      if (!this.selectedItem || !this.activeInputId) return;

      const keyInput = document.getElementById(`${this.activeInputId}_r2_key`);
      const previewEl = document.getElementById(`${this.activeInputId}_preview`);
      const fileInput = document.getElementById(this.activeInputId);

      if (keyInput) {
        keyInput.value = this.selectedItem.key;
      }

      // Reset file input if user had picked a local file
      if (fileInput) {
        fileInput.value = '';
      }

      // Uncheck clear checkbox if present
      const clearCheckbox = document.querySelector(`input[name="${fileInput.name}-clear"]`);
      if (clearCheckbox) {
        clearCheckbox.checked = false;
      }

      // Update preview card
      if (previewEl) {
        const thumb = previewEl.querySelector('.r2-preview-thumb');
        const keyText = previewEl.querySelector('.r2-preview-key');
        if (thumb) thumb.src = this.selectedItem.url;
        if (keyText) keyText.textContent = this.selectedItem.key;
        previewEl.style.display = 'block';
      }

      this.close();
    }

    clearSelection(inputId) {
      const keyInput = document.getElementById(`${inputId}_r2_key`);
      const previewEl = document.getElementById(`${inputId}_preview`);

      if (keyInput) {
        keyInput.value = '';
      }
      if (previewEl) {
        previewEl.style.display = 'none';
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new R2PickerModal());
  } else {
    new R2PickerModal();
  }
})();
