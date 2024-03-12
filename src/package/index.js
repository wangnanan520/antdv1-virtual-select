import virtualSelect from "../components/VirtualSelect/select";

virtualSelect.install = function (Vue) {
    Vue.component('virtualSelect', virtualSelect);
};

export default virtualSelect