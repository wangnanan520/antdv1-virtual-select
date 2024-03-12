import PropTypes from 'ant-design-vue/es/_util/vue-types';
export default {
  props: {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  },
  isSelectOptGroup: true,
};
