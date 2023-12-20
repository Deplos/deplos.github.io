const API = "https://formoid.net/api/push";
const keys = {
    index: "<KEY>",
};
const isDebug = true; // set to false if you're using formoid.net

class FormService {
    constructor() {
        this.form = document.querySelector(".form");

        this.inputs = this.form.querySelectorAll("input:not([id=\"agreement\"]), textarea");
        this.button = this.form.querySelector("button");
    }

    setup() {
        this.form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const language = document.body.getAttribute("lang");

            let page = document.body.getAttribute("page").slice(0, -".html".length);
            page = page === "" ? "index" : page

            const body = {
                email: keys[page] ?? keys.index,
                form: {
                    title: "Form Data",
                    data: [
                        ["page", page],
                        ["language", language]
                    ],
                },
            };
            this.inputs.forEach((input) =>
                body.form.data.push([input.name, input.value])
            );

            this.sendRequest(body)
        });
    }

    sendRequest(body) {
        if (isDebug) {
            this.sendNotification("success")
            return;
        }

        fetch(API, {
            method: "POST",
            body: JSON.stringify(body),
        })
            .then((res) => {
                if (!res.ok) throw new Error(res.error);

                return res.json();
            })
            .then((res) => {
                if (res.error) throw new Error(res.error);
            })
            .then(() => this.sendNotification("success"))
            .catch(() => this.sendNotification("error"));
    }

    sendNotification(type) {
        const delay = 3000;

        this.form.querySelectorAll(".notification").forEach((notification) => {
            if (!notification.classList.contains(type)) return;

            notification.classList.add("show");
            this.button.disabled = true;

            setTimeout(() => {
                notification.classList.remove("show");
                this.button.disabled = false;
            }, delay);
        });
    }
}

const formService = new FormService();
formService.setup();
