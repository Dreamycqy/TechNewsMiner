export default {
  namespace: 'global',
  state: {
    userInfo: {
      email: '',
      pushType: '',
      category: [],
    },
  },
  reducers: {
    save(state, { payload: { userInfo = {} } }) {
      return { ...state, userInfo }
    },
    updateState: (state, { payload }) => {
      return {
        ...state,
        ...payload,
      }
    },
  },
}
