sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
	"sap/ui/model/json/JSONModel",
    "./Utils/Commons",
    "./Utils/ApiPaths",
    "sap/ui/core/Element",
    "sap/m/MessageBox",
], function (jQuery, PluginViewController, JSONModel, Commons, ApiPaths, Element, MessageBox) {
	"use strict";

	return PluginViewController.extend("serviacero.custom.plugins.zpluginGetCaractOrden.zpluginGetCaractOrden.controller.MainView", {
        Commons : Commons,
        ApiPaths : ApiPaths,


		onInit: function () {
			PluginViewController.prototype.onInit.apply(this, arguments);
		},
        getFormatData: function(oData){
            const oItems = { ITEMS: []};
            Object.assign(oItems.ITEMS, oData.customValues);
            return oItems;
        },

        onAfterRendering: function(){
            const oView = this.getView(),
            oSapApi = this.getOwnerComponent().getManifestEntry("/sap.app/dataSources/sapApi-RestSource/uri"),
            oPODParams = this.Commons.getPODParams(this.getOwnerComponent()),
            oTable = oView.byId("CUSTOM_PLUGIN_ORDER_TABLE"),
            sOrder = oPODParams.ORDER_ID,
            sPlant = oPODParams.PLANT_ID,
            sUri = oSapApi + this.ApiPaths.ORDERS + "?plant=" + sPlant + "&order=" + sOrder;
           
           
            this.getView().byId("backButton").setVisible(this.getConfiguration().backButtonVisible);
            this.getView().byId("closeButton").setVisible(this.getConfiguration().closeButtonVisible);
            
            this.getView().byId("headerTitle").setText(this.getConfiguration().title);
            this.getView().byId("textPlugin").setText(this.getConfiguration().text); 

            oTable.setModel(new JSONModel({}));
            this.Commons.consumeApi(sUri, "GET", null, function (oData) {
                //Modelar oData a ITEMS para tabla
                const oItems = this.getFormatData(oData);
                oTable.setModel(new JSONModel(oItems));
                // if (oItems.ITEMS.length != 0 || oItems.ITEMS.length != null || oItems.ITEMS.length != undefined)
                //     oView.getModel("auxActualOrder").setProperty("/order", this.getParams().ORDER_ID)
            }.bind(this));
            // }


        },

		onBeforeRenderingPlugin: function () {

			
			
		},

        isSubscribingToNotifications: function() {
            
            var bNotificationsEnabled = true;
           
            return bNotificationsEnabled;
        },


        getCustomNotificationEvents: function(sTopic) {
            //return ["template"];
        },


        getNotificationMessageHandler: function(sTopic) {

            //if (sTopic === "template") {
            //    return this._handleNotificationMessage;
            //}
            return null;
        },

        _handleNotificationMessage: function(oMsg) {
        },
        

		onExit: function () {
		},
        
        onScanSuccess: function (oEvent) {
            if (oEvent.getParameter("cancelled")) {
                MessageToast.show("Scan cancelled", { duration: 1000 });
            } else {
                if (oEvent.getParameter("text")) {
                    //oScanResultText.setText(oEvent.getParameter("text"));
                    MessageBox.success(oEvent.getParameter("text"));
                } else {
                    //oScanResultText.setText('');
                }
            }
        },

        onScanError: function (oEvent) {
            MessageToast.show("Scan failed: " + oEvent, { duration: 1000 });
        },

        onScanLiveupdate: function (oEvent) {
            // User can implement the validation about inputting value
        }
	});
});