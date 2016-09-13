/*
Price Changer
/Info/Money/budget-russia/
*/

$(document).ready(function () {

	//prices

	var gratuities = 1.1; // +10%, for table "goingOut"

	//Table 1  - RUB (₽)	
	var PRICES_goingOut = [
		//[0]Moscow [1]Else
		[100, 70], //[0]Beer
		[250, 400], //[1]Wine
		[50, 60], //[2]Soft
		[200, 150], //[3]Taxi
		[1000, 700], //[4]Cafe
		[2500, 3500], //[5]Rest
		[500, 125], //[6]Fast
		[150, 55], //[7]Tea
		[50, 0] //[8]Metro
	];

	//Table 2 - RUB (₽)
	var PRICES_rail = [
		//[0]Moscow [1]Else
		[20, 35], //[0]Bread
		[250, 300], //[1]Chicken
		[250, 450], //[2]Meat
		[120, 70], //[3]Fruit
		[100, 125], //[4]Veg
		[500, 375], //[5]Vodka
		[50, 30], //[6]Water
		[70, 70], //[7]Choc
		[100, 60], //[8]Sand
		[150, 55], //[9]Coffee
		[120, 120], //[10]Break
		[400, 400], //[11]Lunch
		[600, 700], //[12]Dinner
		[50, 60], //[13]Wet
		[20, 60], //[14]Paper
		[250, 500] //[15]Porters
	];


	//DOM elements
	var goingOut = $("#goingOut"),
		rail = $("#rail"),
		select_currency = $(".currency-ddl"),
		select_amount = $(".amount");

	//Currencys
	var def_curr = "RUB"; //default currency
	var Currency = [
		{
			val: "RUB",
			rate: 0
		},
		{
			val: "EUR",
			rate: 1
		},
		{
			val: "GBP",
			rate: 0
		},
		{
			val: "USD",
			rate: 0
		}
	];


	/*
	// !!!Временно закомментировала, чтобы работать без локального сервера!!!
	//ECB
	$.ajax({
		type: "GET",
		dataType: "xml",
		url: "/Portals/0/files/XML/ecb.xml",
		cache: false,

		success: function (xml) {
			$(xml).find("Cube").each(function () {
				let currency = $(this).attr("currency"),
					rate = $(this).attr("rate");

				for (let i = 0; i < Currency.length; i++) {
					if (currency === Currency[i].val) Currency[i].rate = rate;
				}
			});

			//Currencys against the ruble
			Currency[1].rate /= Currency[0].rate; //EUR
			Currency[2].rate /= Currency[0].rate; //GBP
			Currency[3].rate /= Currency[0].rate; //USD
			Currency[0].rate /= Currency[0].rate; //RUB

			//Write in the tables
			writTable(goingOut, PRICES_goingOut, def_curr);
			writTable(rail, PRICES_rail, def_curr);
		}
	}); //Ajax ECB - END
	*/

	//Currencys against the ruble
	Currency[1].rate = 0.0137; //EUR
	Currency[2].rate = 0.0116; //GBP
	Currency[3].rate = 0.0154; //USD
	Currency[0].rate = 1; //RUB
	//Write in the tables
	writTable(goingOut, PRICES_goingOut, def_curr);
	writTable(rail, PRICES_rail, def_curr);


	//Switching currencies
	select_currency.click(function () {
		let $this = $(this).children(),
			tab = $this.parents("table").attr("id");

		for (let i = 0; i < $this.length; i++) {
			if ($this[i].selected === true && $this[i].value) {

				switch (tab) {
				case "goingOut":
					writTable(goingOut, PRICES_goingOut, $this[i].value);
					break;
				case "rail":
					writTable(rail, PRICES_rail, $this[i].value);
					break;
				}

				break;
			}
		}

		//Пересчитать общую сумму, с учетом измененной валюты
		reAmount();

		function reAmount() {
			select_amount.click();
		}
	});


	//Amount
	select_amount.click(function () {
		let table = $(this).parents("table"),
			table_id = table.attr("id"),
			selects = table.find("select"),
			prices = [],
			amounts = [],
			price_in,
			rat;

		for (let i = 0; i < selects.length; i++) {
			let cls = selects[i].className;

			switch (cls) {
			case "amount":
				amounts[i] = addAmounts(selects[i]);
				break;
			case "currency-ddl":
				addPriceIn(selects[i]);
				break;
			}

			//Заполнение массива amounts
			function addAmounts(sel) {
				for (let i = 0; i < sel.childNodes.length; i++) {
					if (sel.childNodes[i].selected === true) return sel.childNodes[i].value;
				}
			}

			//Текущее значение валюты
			function addPriceIn(sel) {
				for (let i = 0; i < sel.childNodes.length; i++) {
					if (sel.childNodes[i].selected === true) return price_in = sel.childNodes[i].value;
				}
			}
		}

		if (table_id === "goingOut") newPrices(PRICES_goingOut, gratuities);
		else newPrices(PRICES_rail, 1);

		function newPrices(arr, percent) {
			//currency
			switch (price_in) {
			case "EUR":
				rat = Currency[1].rate;
				break;
			case "GBP":
				rat = Currency[2].rate;
				break;
			case "USD":
				rat = Currency[3].rate;
				break;
			default:
				rat = 1;
				break;
			}

			for (let i = 0; i < arr.length; i++) {
				prices[i] = [];
				for (let j = 0; j < 2; j++) {
					prices[i][j] = arr[i][j] * amounts[i] * rat * percent;
				}
			}
		}

		let sum_1 = 0,
			sum_2 = 0;

		for (let i = 0; i < prices.length; i++) {
			sum_1 += prices[i][0];
			sum_2 += prices[i][1];
		}

		table.find(".moscow").text(numberFormat(sum_1, price_in));
		table.find(".else").text(numberFormat(sum_2, price_in));
	});


	//Write in the tables - function
	function writTable(table, prices, curr) {

		let N,
			t_rat;

		//Получаем значение курса валют
		for (let k = 0; k < Currency.length; k++) {
			if (Currency[k].val === curr) {
				t_rat = Currency[k].rate;
				break;
			}
		}

		//Находим массив строк таблицы
		//Ценами заполняются 2-я и 3-я ячейка каждой строки, кроме перовой, т.е. шапки таблицы
		let tr = table.find("tr");
		for (let i = 0; i < prices.length; i++) {
			for (let j = 0; j < 2; j++) {

				if (prices[i][j] != 0) {
					N = prices[i][j] * t_rat;
					tr[i + 1].children[j + 1].innerText = numberFormat(N, curr);
				} else {
					tr[i + 1].children[j + 1].innerText = "N/A";
				}
			}
		}
	}

	//Number formatting
	function numberFormat(num, cur) {
		let enPrice = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: cur,
			minimumFractionDigits: 2
		});

		if (cur !== "RUB") {
			return enPrice.format(num);
		} else {
			let str = enPrice.format(num).toString();
			str = "₽" + str.substring(3);
			return str;
		}
	}
});