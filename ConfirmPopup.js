

class ConfirmPopup {

	constructor(title, text, buttonCancelText, buttonSubmitText, fnClickOk) {
		this.title = title;
		this.text = text;
		this.buttonSubmitText = buttonSubmitText;
		this.buttonCancelText = buttonCancelText;
		this.fnClickOk = fnClickOk;

	}


	initEventListeners(){
		const closeBtn = this.wrapperPopup.querySelector(".popup__btn_close");
		const cancelBtn = this.wrapperPopup.querySelector(".popup__btn_cancel");
		const overlay = this.wrapperPopup.querySelector(".popup__overlay");

		overlay.addEventListener("click", () => {
			this.close();
		})
		
		closeBtn.addEventListener("click", () => {
			this.close();
		});

		cancelBtn.addEventListener("click", () => {
			this.close();
		});

		this.submitBtn.addEventListener("click", () => {
			this.fnClickOk();
			this.close();
		})
	}

	createHtml() {
		this.wrapperPopup = document.createElement("div");

		this.wrapperPopup.classList.add("popup", "confirmation-popup");

		this.htmlTemplate = `
		<div class="popup__overlay"></div>
		<div class="popup__content">
	
			<div class="popup__header">
				<div class="popup__btn popup__btn_close">
					<i class="fa-solid fa-xmark"></i>
				</div>
				<h3 class="popup__title"> ${this.title} </h3>
			</div>
			<div class="popup__body">
				<p>${this.text}</p>
			</div>
			<div class="popup__footer">
				<button type="button" class="popup__btn popup__btn_cancel confirmation-popup__btn-cancel">${this.buttonCancelText}</button>
				<button type="button" class="popup__btn popup__btn_submit confirmation-popup__btn-submit">${this.buttonSubmitText}</button>				
			</div>
		</div>
	
	`
		this.wrapperPopup.innerHTML = this.htmlTemplate;
		document.body.appendChild(this.wrapperPopup);
	}


	open() {
		this.createHtml();
		this.wrapperPopup.classList.add("_open");
		this.submitBtn = this.wrapperPopup.querySelector(".popup__btn_submit");
		this.submitBtn.focus();
		this.initEventListeners();
	}

	close() {
		this.wrapperPopup.remove();
	}


}





export { ConfirmPopup };