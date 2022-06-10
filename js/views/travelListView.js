import { View } from "./View.js";

class TravelListView extends View {
  _parentElement = document.querySelector(".form-list");
  _errorMessage = "尚未搜尋到相關內容。";

  _body = document.querySelector("body");
  _toolContainer = document.querySelector(".tool-container");
  _travelContainer = document.querySelector(".travel-container");
  _map = document.querySelector("#map");
  _searchBar = document.querySelector(".search-bar");
  _searchAddressBar = document.querySelector(".search-address-bar");
  _searchAddressList = document.querySelector(".easy-autocomplete-container");

  _firstForm = document.querySelector(".first-form");
  _formActive = document.querySelector(".form-active");
  _inputYear = document.querySelector(".form-input--year");
  _inputMonth = document.querySelector(".form-input--month");
  _inputDay = document.querySelector(".form-input--day");
  _inputHour = document.querySelector(".form-input--hour");
  _inputMin = document.querySelector(".form-input--min");
  _inputType = document.querySelector(".form-input--type");
  _inputTitle = document.querySelector(".form-input--title");
  _inputNote = document.querySelector(".form-input--note");
  _inputPlace = document.querySelector(".form-input--place");
  _inputSearchAddress = document.querySelector(".input-search-address");

  _btntool = document.querySelector(".tool-container");
  _toolBtnSort = document.querySelector(".tool--sort-btn");
  _toolBtnSearch = document.querySelector(".tool--search-btn");

  // 處理工具按鈕
  handleToolBtn(sortHandler, e) {
    if (e.target.classList.contains("tool-control"))
      this._toolContainer.classList.toggle("show-tool");

    if (e.target.classList.contains("sort")) {
      if (
        !this._toolBtnSearch.classList.contains("search-active") &&
        document.querySelector(".search-input").value !== ""
      )
        return;

      if (!this._toolBtnSort.classList.contains("sort-active"))
        sortHandler(true);
      if (this._toolBtnSort.classList.contains("sort-active"))
        sortHandler(false);
      this._toolBtnSort.classList.toggle("sort-active");
    }

    if (e.target.classList.contains("search")) {
      this._searchBar.style.top = window
        .getComputedStyle(this._map)
        .getPropertyValue("height");
      this._searchBar.classList.toggle("hidden");
      this._toolBtnSearch.classList.toggle("search-active");
    }

    if (e.target.classList.contains("add")) {
      this._firstForm.classList.toggle("form-active");
      this._inputYear.focus();
      this._searchAddressBar.classList.toggle("hidden");
      this._firstForm.classList.toggle("form-hidden");
    }
  }

  // 處理工具按鈕關閉
  handleToolBtnClose(e) {
    if (e.target.classList.contains("tool-control")) return;
    this._toolContainer.classList.remove("show-tool");
  }

  addHandlerToolBtn(sortHandler) {
    this._btntool.addEventListener(
      "click",
      this.handleToolBtn.bind(this, sortHandler)
    );
    this._body.addEventListener("click", this.handleToolBtnClose.bind(this));
  }

  // 傳送表單資料
  getNewItem() {
    const newItem = {
      inputYear: this._inputYear.value,
      inputMonth: this._inputMonth.value.padStart(2, "0"),
      inputDay: this._inputDay.value.padStart(2, "0"),
      inputHour: this._inputHour.value.padStart(2, "0"),
      inputMin: this._inputMin.value.padStart(2, "0"),
      inputType: this._inputType.value,
      inputTitle: this._inputTitle.value,
      inputNote: this._inputNote.value,
      inputPlace: this._inputPlace.value,
    };
    this._clearInput();
    return newItem;
  }

  _clearInput() {
    this._inputYear.value =
      this._inputMonth.value =
      this._inputDay.value =
      this._inputHour.value =
      this._inputMin.value =
      this._inputType.value =
      this._inputTitle.value =
      this._inputNote.value =
      this._inputPlace.value =
        "";

    this._firstForm.classList.remove("form-active");
    this._firstForm.classList.add("form-hidden");
  }

  addHandlerNewTravelItem(handler) {
    this._firstForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (document.querySelector(".form-input--place").value === "")
        return alert("請輸入地點");
      document.querySelector(".search-address-bar").classList.add("hidden");
      handler();
    });
  }

  deleteItem(handler, e) {
    if (e.target.classList.contains("first-delete-btn")) {
      this._searchAddressBar.classList.add("hidden");
      this._clearInput();
    } else {
      // 回傳當前要刪除的表單ID
      handler(e.target.closest(".form").dataset.id);
    }
  }

  // 回傳更新後的表單資料
  getUpdateItem() {
    const updateItem = {
      inputYear: this._formActive.querySelector(".form-input--year").value,
      inputMonth: this._formActive
        .querySelector(".form-input--month")
        .value.padStart(2, "0"),
      inputDay: this._formActive
        .querySelector(".form-input--day")
        .value.padStart(2, "0"),
      inputHour: this._formActive
        .querySelector(".form-input--hour")
        .value.padStart(2, "0"),
      inputMin: this._formActive
        .querySelector(".form-input--min")
        .value.padStart(2, "0"),
      inputType: this._formActive.querySelector(".form-input--type").value,
      inputTitle: this._formActive.querySelector(".form-input--title").value,
      inputNote: this._formActive.querySelector(".form-input--note").value,
      inputPlace: this._formActive.querySelector(".form-input--place").value,
    };
    return updateItem;
  }

  updateItem(handler, e) {
    e.target.closest(".form").classList.remove("form-lock");
    e.target.closest(".form").classList.add("form-active");
    this._searchAddressBar.classList.remove("hidden");

    // 重新綁定被激活的表單
    this._formActive = document.querySelector(".form-active");
    const address = this._formActive.querySelector(".form-input--place").value;
    e.target.closest(".update-btn").classList.add("hidden");
    e.target.nextElementSibling.classList.remove("hidden");

    // 移除表單唯讀屬性
    e.target.parentNode.parentNode
      .querySelectorAll(".form-input")
      .forEach((el) => {
        el.removeAttribute("readonly");
        el.removeAttribute("disabled");
      });
    this._inputPlace.setAttribute("readonly", "");

    this._formActive.addEventListener("submit", function (e) {
      e.preventDefault();
      document.querySelector(".search-address-bar").classList.add("hidden");
      handler(
        e.target.closest(".form").dataset.id,
        e.target.closest(".form").dataset.coords,
        address
      );
    });
  }

  // 處理表單事件
  handleTravelItem(deleteHandler, updateHandler, moveHandler, e) {
    if (e.target.classList.contains("delete-btn")) {
      this._searchAddressBar.classList.add("hidden");
      return this.deleteItem(deleteHandler, e);
    }

    if (e.target.classList.contains("update-btn")) {
      // 判斷當前是否有其他表單尚未儲存
      if (
        this._parentElement.querySelectorAll(".form-active").length > 0 ||
        this._firstForm.classList.contains("form-active")
      )
        return alert("有行程尚未保存，請先進行保存，再進行修改。");

      return this.updateItem(updateHandler, e);
    }

    if (!e.target.closest(".form-lock")) return;

    if (e.target.closest(".form-lock")) {
      moveHandler(e.target.closest(".form-lock").dataset.id);
    }
  }

  // 行程表單創建事件監聽器 (包含刪除、修改、移動地圖)
  addHandlerTravelItem(deleteHandler, updateHandler, moveHandler) {
    this._travelContainer.addEventListener(
      "click",
      this.handleTravelItem.bind(
        this,
        deleteHandler,
        updateHandler,
        moveHandler
      )
    );
  }

  ////////////////////// MAP ////////////////////////

  showForm(clickHandler, e) {
    if (
      e.target.classList.contains("leaflet-marker-icon") ||
      e.target.classList.contains("input-search-address")
    )
      return;

    // 當前沒有其他表單被激活，代表我要新增表單
    if (this._parentElement.querySelectorAll(".form-active").length === 0) {
      setTimeout(() => {
        // 接收 map 數據並顯示在表單中
        const mapEvent = clickHandler();
        if (mapEvent.length <= 2) return;

        this._firstForm.classList.add("form-active");
        this._inputYear.focus();
        this._firstForm.classList.remove("form-hidden");
        this._searchAddressBar.classList.remove("hidden");
        this._inputPlace.value = mapEvent[2];
        this._inputSearchAddress.value = "";
      }, 600); // 延遲
    } else {
      setTimeout(() => {
        const mapEvent = clickHandler();
        if (mapEvent.length <= 2) return;

        this._formActive.querySelector(".form-input--place").value =
          mapEvent[2];
        this._inputSearchAddress.value = "";
      }, 600);
    }
  }

  // 地圖點擊監聽器
  addHandlerClickMap(handler) {
    this._map.addEventListener("click", this.showForm.bind(this, handler));
  }

  // 地圖搜尋建議監聽器
  addHandlerSearchAddressList(handler) {
    this._searchAddressList.addEventListener(
      "click",
      this.showForm.bind(this, handler)
    );
  }

  ////////////////////// Generate Html ////////////////////////

  _generateMarkup() {
    return this._data.map(this._generateMarkupPreview).join("");
  }

  _generateMarkupPreview(item) {
    return `
    <form class="form form-lock form-border-${item.inputType}" data-id=${
      item.id
    } data-coords=${item.itemPosition}>
      <div class="form-row">
        <label class="form-label">時間:</label>
        <div class="form-row--list">
          <input
            class="form-input form-input--year"
            placeholder="年"
            type="number"
            min="2022"
            value="${item.inputYear}"
            readonly
            required
          />
          <span class="form-label">/</span>
          <input
            class="form-input form-input--month"
            placeholder="月"
            type="number"
            min="1"
            max="12"
            value="${item.inputMonth}"
            readonly
            required
          />
          <span class="form-label">/</span>
          <input
            class="form-input form-input--day"
            placeholder="日"
            type="number"
            min="1"
            max="31"
            value="${item.inputDay}"
            readonly
            required
          />

          <input
            class="form-input form-input--hour"
            placeholder="00"
            type="number"
            min="00"
            max="24"
            value="${item.inputHour}"
            readonly
          />
          <span class="form-label">:</span>
          <input
            class="form-input form-input--min"
            placeholder="00"
            type="number"
            min="00"
            max="59"
            value="${item.inputMin}"
            readonly
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-row--list">
          <label class="form-label">類型:</label>
          <select class="form-input form-input--type" 
          disabled required>
            <option value="">----</option>
            <option value="eat" ${
              item.inputType === "eat" ? "selected" : ""
            }>食</option>
            <option value="site" ${
              item.inputType === "site" ? "selected" : ""
            }>住</option>
            <option value="play" ${
              item.inputType === "play" ? "selected" : ""
            }>玩</option>
            <option value="buy" ${
              item.inputType === "buy" ? "selected" : ""
            }>購</option>
          </select>

          <label class="form-label">標題:</label>
          <input
            class="form-input form-input--title"
            placeholder=""
            value="${item.inputTitle}"
          readonly
            required
          />
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">備註:</label>
        <textarea rows="2" class="form-input form-input--note" readonly>${item.inputNote.trim()}</textarea>
      </div>


      <div class="form-row">
        <a href="http://maps.google.com/?q=${
          item.inputPlace
        }" class="google-map" target="_blank">
          <ion-icon class="google-map-icon" name="navigate-circle-outline"></ion-icon>
        </a>
        <label class="form-label place-label">地點:</label>
        <textarea rows="2" class="form-input form-input--place" readonly>${item.inputPlace.trim()}</textarea>
      </div>
      

      <div class="form-row-btn">
        <button type="button" class="form-btn delete-btn">刪除</button>
        <button type="button" class="form-btn update-btn">修改</button>
        <button class="form-btn first-save-btn save-btn hidden">保存</button>
      </div>
    </form>
    `;
  }
}

export default new TravelListView();
