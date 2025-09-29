sap.ui.define([], function () {
    'use strict';
    return {
        /** API CONSUMPTION TYPE : GET  */

        //  Finds order data by plant and order
        ORDERS : "order/v1/orders",

        //  Find material
        MATERIALS : "/material/v1/materials",

        //  Gets storage locations for a given plant
        STORAGE_LOCATION : "/inventory/v1/storageLocations",

        //  Retrieves batches and batch characteristics for a given plant and material
        BATCHES : "inventory/v1/batches",

        //  Gets stock information for a given plant
        INVENTORIES : "inventory/v1/inventories",

        //  Get all units of measure
        UOMS : "uom/v1/uoms/",

        //  Searches for work centers by plant and work center values
        WORKCENTERS : "workcenter/v2/workcenters",



        /** API CONSUMPTION TYPE : PUT  */

        //  Update SFC default batch ID
        SFC_BATCH : "sfc/v1/batch",

        //  Retrieves the components already assembled. API Consuption Type: PUT, POST
        ASSEMBLED_COMPONENTS : "assembly/v1/assembledComponents",

        //  Find BOM
        BOMS : "bom/v1/boms",

        

        /** API CONSUMPTION TYPE : PATCH */

        //  Updates order custom values
        ORDER_CUSTOM_VALUES : "order/v1/orders/customValues",



        /** API CONSUMPTION TYPE : POST  */
        
        //  Posts goods receipts for products in the plant that has enabled inventory Management
        ERP_GOODS_RECEIPTS : "inventory/v1/inventory/erpGoodsReceipts",

        //  Creates a batch number for a given plant and material
        INVENTORY_BATCH : "inventory/v1/batch",

        //  Create or update batch characteristics
        BATCH_CHARS : "inventory/v1/batchCharacteristics",

    }
});