$(function () {
  $(".header__hamburger").on("click", function () {
    $(".hamburger").toggleClass("is-active");
    $(".header__menu-mobile").toggleClass("mobile-menu-active");
    $(".bgmobile").toggleClass("bgmobile-active");
  });

  var bannerSlider = $(".slider").slick({
    fade: true,
    autoplay: true,
    dots: true,
    arrows: false,
    speed: 1000,
    autoplaySpeed: 5000,
  });

  $(".sl-prev").on("click", function (e) {
    e.preventDefault();
    bannerSlider.slick("slickPrev");
  });

  $(".sl-next").on("click", function (e) {
    e.preventDefault();
    bannerSlider.slick("slickNext");
  });

  var newsSlider = $(".news__slider").slick({
    autoplay: true,
    dots: false,
    arrows: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplaySpeed: 5000,
    speed: 1000,
  });

  var colabSlider = $(".colab__slider").slick({
    autoplay: true,
    dots: false,
    arrows: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplaySpeed: 5000,
    speed: 1000,
  });

  //cart count

  var calculateTotals = function () {
    var total = 0;
    $(".cart__item-contain").each(function () {
      var price = parseInt($(this).find("[data-price]").data("price"));
      var q = parseInt($(this).find("[data-q]").attr("data-q"));
      total += price * q;
    });
    $(".cart__total .mobile-total span").text(total);
  };

  var calculateCartItems = function () {
    var counter = 0;
    $(".cart__item").each(function () {
      counter++;
    });
    return counter;
  };

  $(document).ready(function () {
    var qInput = $(".quantity input");
    qInput.after("<div class='q-plus quant'>+</div>");
    qInput.before("<div class='q-minus quant'>-</div>");
    $(document).on("click", ".quant", function () {
      qInput = $(this).siblings("input");
      var q = parseInt(qInput.val());
      if ($(this).hasClass("q-plus")) {
        q++;
      } else if ($(this).hasClass("q-minus") && q >= 2) {
        q--;
      }
      qInput.val(q);
      var parents = $(this).parents(".cart__item-contain");
      var price = parseInt(parents.find(".cart__price").data("price"));
      var newPrice = price * q;
      parents.find(".cart__price").attr("data-q", q);
      parents
        .find(".woocommerce-Price-amount")
        .html(
          '<span class="woocommerce-Price-amount amount">' +
            newPrice +
            '<span class="woocommerce-Price-currencySymbol"> грн</span></span>'
        );

      calculateTotals();

      var productID = $(this).parents(".cart__item").attr("data-productid");
      window.cartObj[productID].quantity = q;
      window.cartObj[productID].line_total = newPrice;

      $.ajax({
        url: "/",
        method: "GET",
        data: {
          action: "change_quantity",
          q: q,
          cart_item_id: parents.data("key"),
        },
        success: function (data) {
          console.log(data);
        },
      });
    });

    $(document).on("click", ".cart__delete a", function (e) {
      e.preventDefault();
      var parent = $(this).parents(".cart__item");
      parent.remove();
      var cartItemsCount = calculateCartItems();
      if (cartItemsCount == 0) {
        $(".woocommerce").html(
          '<p class="cart-empty">Ваша корзина пока пуста.</p>	<p class="return-to-shop"><a class="button wc-backward" href="/shop/">Вернуться в магазин</a></p>'
        );
      }
      var cartProductID = $(this).data("product_cartid");
      var productID = $(this).data("product_id");
      window.cartCount--;
      document.querySelector(".header__cart-count").innerHTML =
        window.cartCount;
      delete window.cartObj[productID];
      $.ajax({
        action: "/",
        data: {
          action: "removeFromCart",
          id: cartProductID,
        },
        success: function (id) {
          console.log(id);
        },
      });
    });

    $(document).on("click", ".desktop-clear-cart", function () {
      var cardIDsArr = [];

      $(".cart__item").each(function () {
        var cartID = $(this).find(".cart__item-contain").data("key");
        cardIDsArr.push(cartID);
      });
      window.cartCount = 0;
      document.querySelector(".header__cart-count").innerHTML = 0;
      window.cartObj = {};
      $.ajax({
        url: "/",
        data: {
          action: "removeAllCart",
          cardIDsArr: cardIDsArr,
        },
        success: function (data) {
          console.log(data);
        },
      });

      $(".woocommerce").html(
        '<p class="cart-empty">Ваша корзина пока пуста.</p>	<p class="return-to-shop"><a class="button wc-backward" href="/shop/">Вернуться в магазин</a></p>'
      );
    });

    if (window.location.hash == "") {
      $(".c-cart").show();
    } else {
      $(".c-subscribe").show();
    }
    $(".cart-wrap").removeClass("loading");

    $(document).on("click", ".cart__checkout a", function (e) {
      e.preventDefault();
      window.location.hash = "step1";
      $(".c-cart").hide();
      $(".c-subscribe").show();
      $("html, body").scrollTop(0);
    });

    var currentDelivery = window.Cookies.get("delivery");
    if (currentDelivery != "" && currentDelivery) {
      $("." + currentDelivery)
        .show()
        .siblings()
        .hide();
    }

    $(document).on("change", "[name=delivery]", function (e) {
      e.preventDefault();
      var value = $(this).val();
      $("." + value)
        .show()
        .siblings()
        .hide();
    });

    var regionSettings = {
      type: "POST",
      dataType: "json",
      url: "https://api.novaposhta.ua/v2.0/json/",
      data: JSON.stringify({
        modelName: "Address",
        calledMethod: "getAreas",
        methodProperties: {},
        apiKey: "acbd806a5d517b52e9b842047e70e3fc",
      }),
      headers: {
        "Content-Type": "application/json",
      },
      xhrFields: {
        // Свойство 'xhrFields' устанавливает дополнительные поля в XMLHttpRequest. // Это можно использовать для установки свойства 'withCredentials'. // Установите значение «true», если вы хотите передать файлы cookie на сервер. // Если это включено, ваш сервер должен ответить заголовком // 'Access-Control-Allow-Credentials: true'.
        withCredentials: false,
      },
      success: function (texts) {
        // console.log(texts);
      },
    };

    $.ajax(regionSettings).done(function (responseRegion) {
      for (var region of responseRegion.data) {
        $("#region-np").append(
          "<option value=" +
            region.Description +
            " data-ref=" +
            region.Ref +
            ">" +
            region.Description +
            "</option>"
        );
      }
      $(".region").select2();
      $(".region").on("select2:select", function (e) {
        var data = e.params.data;
        window.Cookies.set("region", data.text);

        var citySettings = {
          type: "POST",
          dataType: "json",
          url: "https://api.novaposhta.ua/v2.0/json/",
          data: JSON.stringify({
            modelName: "Address",
            calledMethod: "getCities",
            Area: data.element.dataset.ref,
            methodProperties: {},
            apiKey: "acbd806a5d517b52e9b842047e70e3fc",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          xhrFields: {
            // Свойство 'xhrFields' устанавливает дополнительные поля в XMLHttpRequest. // Это можно использовать для установки свойства 'withCredentials'. // Установите значение «true», если вы хотите передать файлы cookie на сервер. // Если это включено, ваш сервер должен ответить заголовком // 'Access-Control-Allow-Credentials: true'.
            withCredentials: false,
          },
          success: function (texts) {
            // console.log(texts);
          },
        };
        $.ajax(citySettings).done(function (responseCity) {
          if ($(".city").next().hasClass("select2")) {
            $(".city").select2("destroy");
            $("#cities-np").html("");
          }
          for (var city of responseCity.data) {
            if (city.Area == data.element.dataset.ref) {
              $("#cities-np").append(
                "<option value=" +
                  city.Description +
                  " data-ref=" +
                  city.Ref +
                  ">" +
                  city.Description +
                  "</option>"
              );
            }
          }
          $(".city").select2();
          $(".city").on("select2:select", function (e) {
            var data = e.params.data;
            window.Cookies.set("city", data.text);
            var wareHouseSettings = {
              type: "POST",
              dataType: "json",
              url: "https://api.novaposhta.ua/v2.0/json/",
              data: JSON.stringify({
                modelName: "Address",
                calledMethod: "getWarehouses",
                methodProperties: {
                  CityRef: data.element.dataset.ref,
                },
                apiKey: "acbd806a5d517b52e9b842047e70e3fc",
              }),
              headers: {
                "Content-Type": "application/json",
              },
              xhrFields: {
                // Свойство 'xhrFields' устанавливает дополнительные поля в XMLHttpRequest. // Это можно использовать для установки свойства 'withCredentials'. // Установите значение «true», если вы хотите передать файлы cookie на сервер. // Если это включено, ваш сервер должен ответить заголовком // 'Access-Control-Allow-Credentials: true'.
                withCredentials: false,
              },
              success: function (texts) {
                // console.log(texts);
              },
            };
            $.ajax(wareHouseSettings).done(function (responseWareHouse) {
              if ($(".stage").next().hasClass("select2")) {
                $(".stage").select2("destroy");
                $("select.stage").html("");
              }
              for (var wareHouse of responseWareHouse.data) {
                // if(wareHouse.Area == data.id){
                $("select.stage").append(
                  '<option value="' +
                    wareHouse.Description +
                    '" data-ref=' +
                    wareHouse.Ref +
                    ">" +
                    wareHouse.Description +
                    "</option>"
                );
                // }
              }
              $(".stage").select2();
              $(".stage").on("select2:select", function (e) {
                window.Cookies.set("place", e.params.data.text);
              });
            });
          });
        });
      });
    });

    /*$(document).ready(function(){
			$('body').on('DOMSubtreeModified', '#select2-region-np-container', function(){
				var areaTitle = $('#select2-region-np-container').attr('title');
				console.log(areaTitle);
			});
		});*/

    $(".select2").on("click", function () {
      var regInfo = $("#region-np").find(":selected").attr("title");
      console.log(regInfo);
    });

    var timeout;
    $(document).on("keypress", ".cookie-save", function () {
      var $this = $(this);
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        $this.trigger("change");
      }, 200);
    });
    $(document).on("change", ".cookie-save", function () {
      var value;
      var name = $(this).attr("name");
      if ($(this).attr("type") == "checkbox") {
        var values = [];
        $("[name='" + name + "']").each(function () {
          if (this.checked == true) {
            values.push($(this).val());
          }
        });
        value = values.join(",");
      } else {
        value = $(this).val();
      }
      window.Cookies.set(name, value);
    });

    $(document).on("submit", ".sert__form", function (e) {
      e.preventDefault();
      var data = {
        action: "add-order",
      };
      $(
        ".woocommerce input[type=text],.woocommerce input[type=email],.woocommerce input[type=tel],.woocommerce input[type=checkbox]:checked,.woocommerce input[type=radio]:checked,.woocommerce textarea,.woocommerce select"
      ).each(function () {
        if ($(this).val() != "" && $(this).val() !== null) {
          if (
            data[$(this).attr("name")] &&
            ($(this).attr("type") == "checkbox" ||
              $(this).attr("type") == "radio")
          ) {
            data[$(this).attr("name")] += ", " + $(this).val();
          } else {
            data[$(this).attr("name")] = $(this).val();
          }
        }
      });

      $("." + data.delivery + " input, ." + data.delivery + " select").each(
        function () {
          var $item = $(this),
            name = $item.attr("name"),
            value = $item.val() || window.Cookies.get(name);
          if (!data.hasOwnProperty(name)) {
            data[name] = value || window.Cookies.get(name);
          }
        }
      );

      for (var propName in data) {
        if (data[propName] === null || data[propName] === undefined) {
          delete data[propName];
        }
      }

      console.log(data);
      $.ajax({
        method: "POST",
        url: "/",
        data: data,
        success: function (res) {
          if (data.groupPay === "paypal") {
            formPost(
              "https://www.sandbox.paypal.com/cgi-bin/webscr",
              createPaypalParams(res)
            );
          }
          if (data.groupPay === "liqpay") {
            var liqForm = $(JSON.parse(res).form);
            liqForm.css("display", "none");
            $(document.body).append(liqForm);
            liqForm.submit();
          }
        },
      });
    });

    function createPaypalParams(order_id) {
      var params = {
        business: "sb-e5gok418099@business.example.com",
        currency_code: "USD",
        notify_url:
          "http://new.clew.shop/?action=check_payment&gateway=paypal&order_id=" +
          order_id,
        cancel_return:
          "http://new.clew.shop/?action=check_payment&status=fail&gateway=paypal&order_id=" +
          order_id,
        return:
          "http://new.clew.shop/?action=check_payment&status=success&gateway=paypal&order_id=" +
          order_id,
        cmd: "_cart",
        upload: 1,
        charset: "utf-8",
      };
      var i = 1;
      for (var variable in window.cartObj) {
        params["item_name_" + i] = window.cartObj[variable].title;
        params["amount_" + i] = window.cartObj[variable].line_total;
        i++;
      }

      return params;
    }

    function formPost(path, parameters) {
      var form = $("<form></form>");

      form.attr("method", "post");
      form.attr("action", path);

      $.each(parameters, function (key, value) {
        if (typeof value == "object" || typeof value == "array") {
          $.each(value, function (subvalue) {
            var field = $("<input />");
            field.attr("type", "hidden");
            field.attr("name", key + "[]");
            field.attr("value", subvalue);
            form.append(field);
          });
        } else {
          var field = $("<input />");
          field.attr("type", "hidden");
          field.attr("name", key);
          field.attr("value", value);
          form.append(field);
        }
      });
      $(document.body).append(form);
      form.submit();
    }
  });

  $(".desktop-menu-link").hover(function () {
    $(this).find(".desktop-menu-toggle").toggleClass("dmt-active");
  });
});
