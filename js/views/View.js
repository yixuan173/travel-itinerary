export class View {
  _data;

  // 渲染畫面
  render(data) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderErrorMessage();
    this._data = data;

    const markup = this._generateMarkup();

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  _clear() {
    this._parentElement.innerHTML = "";
  }

  renderErrorMessage(message = this._errorMessage) {
    const markup = `
    <div class="error">
      <ion-icon class="error-icon" name="information-circle-outline"></ion-icon>
      <p class="error-msg">${message}</p>
    </div>
  `;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }
}
