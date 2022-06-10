class SearchView {
  _searchInput = document.querySelector(".search-input");

  getQuery() {
    const query = this._searchInput.value;

    return query;
  }

  addHandlerSearch(handler) {
    this._searchInput.addEventListener("input", function () {
      handler();
    });
  }
}

export default new SearchView();
