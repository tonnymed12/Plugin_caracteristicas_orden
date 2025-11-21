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
        Commons: Commons,
        ApiPaths: ApiPaths,


        onInit: function () {
            PluginViewController.prototype.onInit.apply(this, arguments);
        },
        getFormatData: function (oData) {
            const oItems = { ITEMS: [] };
            Object.assign(oItems.ITEMS, oData.customValues);
            return oItems;
        },
        /**
        * Construye el filter OData para obtener las descripciones
        * @param {Array} aAttributes - Array de atributos
        * @returns {string} - String con el filtro OData
        */
        filtroCaracteristicas: function (aAttributes) {
            if (!aAttributes || aAttributes.length === 0) {
                return "";
            }

            const aFilters = aAttributes.map(function (sAttribute) {
                return "charcExternalId eq '" + sAttribute + "'";
            });

            return "$filter=" + aFilters.join(" or ");
        },
        /**
         * Parsea el XML de respuesta y extrae las descripciones el codigo de característica
         * @param {string} sXmlString - XML string de la respuesta del servicio
         * @param {string} sLanguage - Idioma deseado (EN o ES)
         * @returns {Object} - Mapa con código de característica como key y descripción como value
         */
        parseCaracteristicasXML: function (sXmlString, sLanguage) {
            const oDescriptions = {};
            sLanguage = sLanguage || "ES"; // Por defecto español

            try {
                const oParser = new DOMParser();
                const oXmlDoc = oParser.parseFromString(sXmlString, "text/xml");

                // Definir los namespaces
                const NS = {
                    atom: "http://www.w3.org/2005/Atom",
                    metadata: "http://docs.oasis-open.org/odata/ns/metadata",
                    data: "http://docs.oasis-open.org/odata/ns/data"
                };

                // Obtener todos los entries (características) con namespace
                const aEntries = oXmlDoc.getElementsByTagNameNS(NS.atom, "entry");
                // console.log("Total de entries encontrados:", aEntries.length);

                for (let i = 0; i < aEntries.length; i++) {
                    const oEntry = aEntries[i];

                    // Obtener content
                    const aContents = oEntry.getElementsByTagNameNS(NS.atom, "content");
                    if (aContents.length === 0) {
                        // console.log("No se encontro content en entry", i);
                        continue;
                    }

                    // Obtener properties
                    const aProperties = aContents[0].getElementsByTagNameNS(NS.metadata, "properties");
                    if (aProperties.length === 0) {
                        // console.log("No se encontro properties en entry", i);
                        continue;
                    }

                    const oProperties = aProperties[0];

                    // Obtener el código externo de la característica
                    const aExternalIds = oProperties.getElementsByTagNameNS(NS.data, "charcExternalId");
                    if (aExternalIds.length === 0) {
                        // console.log("No se encontró charcExternalId en entry", i);
                        continue;
                    }

                    const sCharCode = aExternalIds[0].textContent;
                    // console.log("Procesando característica:", sCharCode);

                    // Buscar la descripción en el idioma especificado
                    const aCharTexts = oProperties.getElementsByTagNameNS(NS.data, "charcTexts");
                    if (aCharTexts.length === 0) {
                        // console.log("No se encontró charcTexts para:", sCharCode);
                        continue;
                    }

                    const aElements = aCharTexts[0].getElementsByTagNameNS(NS.metadata, "element");
                    // console.log("Elementos encontrados para", sCharCode, ":", aElements.length);

                    for (let j = 0; j < aElements.length; j++) {
                        const oElement = aElements[j];
                        const aLanguageNodes = oElement.getElementsByTagNameNS(NS.data, "language");
                        const aDescriptionNodes = oElement.getElementsByTagNameNS(NS.data, "description");

                        if (aLanguageNodes.length > 0 && aDescriptionNodes.length > 0) {
                            const sLang = aLanguageNodes[0].textContent;
                            const sDescription = aDescriptionNodes[0].textContent;



                            if (sLang === sLanguage) {
                                oDescriptions[sCharCode] = sDescription;
                                // console.log("Descripción asignada para", sCharCode, ":", sDescription);
                                break;
                            }
                        }
                    }
                }

                console.log("Descripciones finales:", oDescriptions);
            } catch (oError) {
                console.error("Error parsing characteristics XML:", oError);
            }

            return oDescriptions;
        },
        /**
         * Enriquece los datos de la orden con las descripciones de las características
         * @param {Array} aItems - Array de items con attribute y value
         * @param {Object} oDescriptions - Mapa de descripciones por código
         */
        itemsWithDescriptions: function (aItems, oDescriptions) {
            aItems.forEach(function (oItem) {
                oItem.description = oDescriptions[oItem.attribute] || "";
            });
        },
        /**
         * Obtiene el idioma del usuario desde SAP UI5
         * @returns {string} - Código de idioma en mayúsculas (ES, EN, etc.)
         */
        getUserLanguage: function () {
            // obteiene el idioma de SAP UI5
            var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();

          
            if (sLanguage && sLanguage.length >= 2) {
                sLanguage = sLanguage.substring(0, 2).toUpperCase();
            }

            // Si no es ES o EN, usar ES por defecto
            if (sLanguage !== "ES" && sLanguage !== "EN") {
                sLanguage = "ES";
            }

            console.log("Idioma del usuario:", sLanguage);
            return sLanguage;
        },


        onAfterRendering: function () {
            const oView = this.getView(),
                oSapApi2 = this.getPublicApiRestDataSourceUri(),
                oSapApi3 = this.Commons.getSapApiPath(this),
                oPODParams = this.Commons.getPODParams(this.getOwnerComponent()),
                oTable = oView.byId("CUSTOM_PLUGIN_ORDER_TABLE"),
                sOrder = oPODParams.ORDER_ID,
                sPlant = oPODParams.PLANT_ID,
                sUri = oSapApi2 + this.ApiPaths.ORDERS + "?plant=" + sPlant + "&order=" + sOrder;

            oTable.setModel(new JSONModel({}));
            this.Commons.consumeApi(sUri, "GET", null, function (oData) {
                //Modelar oData a ITEMS para tabla
                const oItems = this.getFormatData(oData);
                //codigo de las caracteristicas
                const sAttribute = oItems.ITEMS.map(function (oItem) {
                    return oItem.attribute;
                });

                if (sAttribute.length > 0) {
                    //$Filter para la URI
                    const sFilter = this.filtroCaracteristicas(sAttribute);
                    const getDescripcionUri = oSapApi3 + this.ApiPaths.CHARACTERISTICS + "?" + sFilter;

                    const sLanguage = this.getUserLanguage();

                    $.ajax({
                        url: getDescripcionUri,
                        type: "GET",
                        contentType: "application/xml",
                        dataType: "xml",
                        async: true,
                        success: function (oXmlData) {
                            // Parsear el XML y obtener las descripciones
                            const sXmlString = new XMLSerializer().serializeToString(oXmlData);
                            const oDescriptions = this.parseCaracteristicasXML(sXmlString, sLanguage);
                            
                            // Enriquecer los items con las descripciones
                            this.itemsWithDescriptions(oItems.ITEMS, oDescriptions);

                            // Actualizar el modelo de la tabla
                            oTable.setModel(new JSONModel(oItems));
                        }.bind(this),
                        error: function (oError) {
                            console.error("Error en la llamada a l servicio", oError);
                            // Aún así mostrar los datos sin descripción
                            oTable.setModel(new JSONModel(oItems));
                        }.bind(this)
                    });
                } else {
                    oTable.setModel(new JSONModel(oItems));
                }
            }.bind(this));

        },

        onBeforeRenderingPlugin: function () {



        },

        isSubscribingToNotifications: function () {

            var bNotificationsEnabled = true;

            return bNotificationsEnabled;
        },


        getCustomNotificationEvents: function (sTopic) {
            //return ["template"];
        },


        getNotificationMessageHandler: function (sTopic) {

            //if (sTopic === "template") {
            //    return this._handleNotificationMessage;
            //}
            return null;
        },

        _handleNotificationMessage: function (oMsg) {
        },


        onExit: function () {
        }
    });
});