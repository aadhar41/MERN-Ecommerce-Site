import {
    ALL_PRODUCTS_LIST_FAIL,
    ALL_PRODUCTS_LIST_REQUEST,
    ALL_PRODUCTS_LIST_SUCCESS,
    CLEAR_ERRORS
} from "../constants/productConstants";

export const productReducer = (state = { products: [] }, action) => {
    switch (action.type) {
        case ALL_PRODUCTS_LIST_REQUEST:
            return { loading: true, products: [] };
        case ALL_PRODUCTS_LIST_SUCCESS:
            return { loading: false, products: action.payload.products, productsCount: action.payload.totalProducts };
        case ALL_PRODUCTS_LIST_FAIL:
            return { loading: false, error: action.payload };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};