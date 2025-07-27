import { StyleSheet } from 'react-native';
import { theme } from './index.ts';

const styles2 = StyleSheet.create({
  reserved:{
    position: 'absolute',
    bottom: 0,
    textAlign: 'center',
    left: 0,
    right: 0,
    padding: 15,
    color: '#fff',
    fontFamily: theme.font.regular
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  formGroup:{
    marginBottom: 10
  },
  formlabel:{
    fontFamily: theme.font.regular
  },
  container: {
    padding: 20,
  },
  pickerContainer:{
    borderWidth: 1,
    borderColor: 'gray',
    height: 45,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  textUpper:{
    textTransform: 'uppercase'
  },
  label: {
    fontFamily: 'Dongle-Bold',
    fontWeight: 400,
    fontSize: 26
  },
  labelActive: {
    top: 0,
    fontSize: 12,
    color: 'blue',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  header: {
    backgroundColor: '#343a40',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  h11: {
    fontSize: 21,
  },
  h12: {
    fontSize: 22,
  },
  h13: {
    fontSize: 23,
  },
  h14: {
    fontSize: 24,
  },
  h15: {
    fontSize: 25,
  },
  h16: {
    fontSize: 26,
  },
  h17: {
    fontSize: 27,
  },
  h18: {
    fontSize: 28,
  },
  h19: {
    fontSize: 29,
  },
  h20: {
    fontSize: 30,
  },



  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  navLink: {
    color: '#007bff', // Bootstrap primary color
    fontSize: 18,
  },

  // Alert styles (Modal-based warning alert)
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'yellow',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },

  // Button styles
  button: {
    backgroundColor: theme.colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },


  image_holder: {
    borderColor: theme.colors.light.primary,
    borderWidth: 1,
    borderRadius: 100,
    marginRight: 10
  },

  image_25: { width: 25, height: 25 },
  image_30: { width: 30, height: 30 },
  image_35: { width: 35, height: 35 },
  image_40: { width: 40, height: 40 },
  image_45: { width: 45, height: 45 },
  image_50: { width: 50, height: 50 },
  image_55: { width: 55, height: 55 },
  image_60: { width: 60, height: 60 },
  image_65: { width: 65, height: 65 },
  image_70: { width: 70, height: 70 },
  image_75: { width: 75, height: 75 },
  image_80: { width: 80, height: 80 },
  image_85: { width: 85, height: 85 },
  image_90: { width: 90, height: 90 },
  image_95: { width: 95, height: 95 },
  image_100: { width: 100, height: 100 },
  image_105: { width: 105, height: 105 },
  image_110: { width: 110, height: 110 },
  image_115: { width: 115, height: 115 },
  image_120: { width: 120, height: 120 },
  image_125: { width: 125, height: 125 },
  image_130: { width: 130, height: 130 },
  image_135: { width: 135, height: 135 },
  image_140: { width: 140, height: 140 },
  image_145: { width: 145, height: 145 },
  image_150: { width: 150, height: 150 },
  image_155: { width: 155, height: 155 },
  image_160: { width: 160, height: 160 },
  image_165: { width: 165, height: 165 },
  image_170: { width: 170, height: 170 },
  image_175: { width: 175, height: 175 },
  image_180: { width: 180, height: 180 },
  image_185: { width: 185, height: 185 },
  image_190: { width: 190, height: 190 },
  image_195: { width: 195, height: 195 },
  image_200: { width: 200, height: 200 },

textUppercase: {
    textTransform: 'uppercase',
},
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 14,
    marginVertical: 8,
  },
  cardButton: {
    backgroundColor: '#007bff', // Bootstrap button color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  formpicker: {
    height: 50,
    width: '100%',
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  pickerItem: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },


  // Form styles
  formContainer: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 10,
  },

  dropcontainer: {
    height: 10,
    fontFamily: theme.font.regular,
  },
  dropdropdown: {
    backgroundColor: '#fff',
    borderColor: 'lightgray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontFamily: theme.font.regular,
  },
  dropdropDownContainer: {
    backgroundColor: '#fff',
    borderColor: 'lightgray',
    borderWidth: 1,
    zIndex: 9999,
  },
  droptext: {
    fontSize: 16,
    fontFamily: theme.font.regular,
    color: '#000',
  },
  dropsearchContainer: {
    borderBottomColor: 'lightgray',
  },
  dropsearchInput: {
    borderColor: 'lightgray',
    borderWidth: 1,
    borderRadius: 5,
    height: 50,
    fontFamily: theme.font.regular,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 8,
    backgroundColor: '#000',
    marginBottom: 15,
    justifyContent: 'center',
    height: 45,
  },
  picker: {
    color: '#000',
    margin: 0,
  },

  // Footer styles
  footer: {
    padding: 20,
    backgroundColor: '#343a40',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  footerText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    elevation: 200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    backgroundColor: theme.colors.light.primary,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },

  dashboardContainer: {
    flexDirection: 'column',
  },
  courseList: {
    padding: 10,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseContent: {
    flexDirection: 'column',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  courseInfo: {
    fontSize: 14,
    color: '#555',
  },
  dashboardBox: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 18, // For Android shadow
  },
  textwhite:{
    color: '#fff',
  },
  textdanger:{
    color: 'red'
  },
  textdark:{
    color: '#000',
  },
  userInfoSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#fff',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    // marginBottom: 10,
  },
  userName: {
    color: '#fff',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 14,
    color: '#fff',
  },
  textbold:{
    fontWeight: 'bold',
  },
  textcenter:{
    textAlign: 'center',
  },
  courseRow: {
    justifyContent: 'space-between',
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 2,
  },
  boxValue: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    textAlign: 'center',
  },

  elevation20:{
    elevation: 20,
  },

  row: {
    flexDirection: 'row',
    marginBottom: 20,
    // paddingHorizontal: 10,
  },

  row_between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  justify_between: {
    justifyContent: 'space-between'
  },
  col: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    marginHorizontal: 5,
  },

  pt_1:{
      paddingTop: 5,
  },
  pt_2:{
    paddingTop: 6,
  },
  pt_3:{
    paddingTop: 7,
  },
  pt_4:{
    paddingTop: 8,
  },
  pt_5:{
    paddingTop: 9,
  },
  pt_6:{
    paddingTop: 10,
  },
  pt_7:{
    paddingTop: 11,
  },
  pt_8:{
    paddingTop: 12,
  },
  pt_1: { paddingTop: 5 },
  pt_2: { paddingTop: 6 },
  pt_3: { paddingTop: 7 },
  pt_4: { paddingTop: 8 },
  pt_5: { paddingTop: 9 },
  pt_6: { paddingTop: 10 },
  pt_7: { paddingTop: 11 },
  pt_8: { paddingTop: 12 },
  pt_9: { paddingTop: 13 },
  pt_10: { paddingTop: 14 },
  pt_11: { paddingTop: 15 },
  pt_12: { paddingTop: 16 },

  pr_1: { paddingRight: 5 },
  pr_2: { paddingRight: 6 },
  pr_3: { paddingRight: 7 },
  pr_4: { paddingRight: 8 },
  pr_5: { paddingRight: 9 },
  pr_6: { paddingRight: 10 },
  pr_7: { paddingRight: 11 },
  pr_8: { paddingRight: 12 },
  pr_9: { paddingRight: 13 },
  pr_10: { paddingRight: 14 },
  pr_11: { paddingRight: 15 },
  pr_12: { paddingRight: 16 },

  pb_1: { paddingBottom: 5 },
  pb_2: { paddingBottom: 6 },
  pb_3: { paddingBottom: 7 },
  pb_4: { paddingBottom: 8 },
  pb_5: { paddingBottom: 9 },
  pb_6: { paddingBottom: 10 },
  pb_7: { paddingBottom: 11 },
  pb_8: { paddingBottom: 12 },
  pb_9: { paddingBottom: 13 },
  pb_10: { paddingBottom: 14 },
  pb_11: { paddingBottom: 15 },
  pb_12: { paddingBottom: 16 },
  pl_0: { paddingLeft: 0 },    // padding: 5px
  pl_1: { paddingLeft: 5 },
  pl_2: { paddingLeft: 6 },
  pl_3: { paddingLeft: 7 },
  pl_4: { paddingLeft: 8 },
  pl_5: { paddingLeft: 9 },
  pl_6: { paddingLeft: 10 },
  pl_7: { paddingLeft: 11 },
  pl_8: { paddingLeft: 12 },
  pl_9: { paddingLeft: 13 },
  pl_10: { paddingLeft: 14 },
  pl_11: { paddingLeft: 15 },
  pl_12: { paddingLeft: 16 },

  mt_0: { marginTop: 0 },
  mt_1: { marginTop: 5 },
  mt_2: { marginTop: 6 },
  mt_3: { marginTop: 7 },
  mt_4: { marginTop: 8 },
  mt_5: { marginTop: 9 },
  mt_6: { marginTop: 10 },
  mt_7: { marginTop: 11 },
  mt_8: { marginTop: 12 },
  mt_9: { marginTop: 13 },
  mt_10: { marginTop: 14 },
  mt_11: { marginTop: 15 },
  mt_12: { marginTop: 16 },

  mr_1: { marginRight: 5 },
  mr_2: { marginRight: 6 },
  mr_3: { marginRight: 7 },
  mr_4: { marginRight: 8 },
  mr_5: { marginRight: 9 },
  mr_6: { marginRight: 10 },
  mr_7: { marginRight: 11 },
  mr_8: { marginRight: 12 },
  mr_9: { marginRight: 13 },
  mr_10: { marginRight: 14 },
  mr_11: { marginRight: 15 },
  mr_12: { marginRight: 16 },
  mlr_10: { marginRight: 14, marginLeft: 14 },

  mb_0: { marginBottom: 0 },
  mb_1: { marginBottom: 5 },
  mb_2: { marginBottom: 6 },
  mb_3: { marginBottom: 7 },
  mb_4: { marginBottom: 8 },
  mb_5: { marginBottom: 9 },
  mb_6: { marginBottom: 10 },
  mb_7: { marginBottom: 11 },
  mb_8: { marginBottom: 12 },
  mb_9: { marginBottom: 13 },
  mb_10: { marginBottom: 14 },
  mb_11: { marginBottom: 15 },
  mb_12: { marginBottom: 16 },

  ml_1: { marginLeft: 5 },
  ml_2: { marginLeft: 6 },
  ml_3: { marginLeft: 7 },
  ml_4: { marginLeft: 8 },
  ml_5: { marginLeft: 9 },
  ml_6: { marginLeft: 10 },
  ml_7: { marginLeft: 11 },
  ml_8: { marginLeft: 12 },
  ml_9: { marginLeft: 13 },
  ml_10: { marginLeft: 14 },
  ml_11: { marginLeft: 15 },
  ml_12: { marginLeft: 16 },

  rounded1: { borderRadius: 1 },
  rounded2: { borderRadius: 2 },
  rounded3: { borderRadius: 3 },
  rounded4: { borderRadius: 4 },
  rounded5: { borderRadius: 5 },
  rounded6: { borderRadius: 6 },
  rounded7: { borderRadius: 7 },
  rounded8: { borderRadius: 8 },
  rounded9: { borderRadius: 9 },
  rounded10: { borderRadius: 10 },
  rounded11: { borderRadius: 11 },
  rounded12: { borderRadius: 12 },
  rounded13: { borderRadius: 13 },
  rounded14: { borderRadius: 14 },
  rounded15: { borderRadius: 15 },
  rounded16: { borderRadius: 16 },
  rounded17: { borderRadius: 17 },
  rounded18: { borderRadius: 18 },
  rounded19: { borderRadius: 19 },
  rounded20: { borderRadius: 20 },
  rounded21: { borderRadius: 21 },
  rounded22: { borderRadius: 22 },
  rounded23: { borderRadius: 23 },
  rounded24: { borderRadius: 24 },
  rounded25: { borderRadius: 25 },
  rounded26: { borderRadius: 26 },
  rounded27: { borderRadius: 27 },
  rounded28: { borderRadius: 28 },
  rounded29: { borderRadius: 29 },
  rounded30: { borderRadius: 30 },
  rounded31: { borderRadius: 31 },
  rounded32: { borderRadius: 32 },
  rounded33: { borderRadius: 33 },
  rounded34: { borderRadius: 34 },
  rounded35: { borderRadius: 35 },
  rounded36: { borderRadius: 36 },
  rounded37: { borderRadius: 37 },
  rounded38: { borderRadius: 38 },
  rounded39: { borderRadius: 39 },
  rounded40: { borderRadius: 40 },
  rounded41: { borderRadius: 41 },
  rounded42: { borderRadius: 42 },
  rounded43: { borderRadius: 43 },
  rounded44: { borderRadius: 44 },
  rounded45: { borderRadius: 45 },
  rounded46: { borderRadius: 46 },
  rounded47: { borderRadius: 47 },
  rounded48: { borderRadius: 48 },
  rounded49: { borderRadius: 49 },
  rounded50: { borderRadius: 50 },
  rounded: { borderRadius: 100 },

// Border Top Widths (bt_1 to bt_12)
  bt_1: { borderTopWidth: 1 },
  bt_2: { borderTopWidth: 2 },
  bt_3: { borderTopWidth: 3 },
  bt_4: { borderTopWidth: 4 },
  bt_5: { borderTopWidth: 5 },
  bt_6: { borderTopWidth: 6 },
  bt_7: { borderTopWidth: 7 },
  bt_8: { borderTopWidth: 8 },
  bt_9: { borderTopWidth: 9 },
  bt_10: { borderTopWidth: 10 },
  bt_11: { borderTopWidth: 11 },
  bt_12: { borderTopWidth: 12 },

  // Border Left Widths (bl_1 to bl_12)
  bl_1: { borderLeftWidth: 1 },
  bl_2: { borderLeftWidth: 2 },
  bl_3: { borderLeftWidth: 3 },
  bl_4: { borderLeftWidth: 4 },
  bl_5: { borderLeftWidth: 5 },
  bl_6: { borderLeftWidth: 6 },
  bl_7: { borderLeftWidth: 7 },
  bl_8: { borderLeftWidth: 8 },
  bl_9: { borderLeftWidth: 9 },
  bl_10: { borderLeftWidth: 10 },
  bl_11: { borderLeftWidth: 11 },
  bl_12: { borderLeftWidth: 12 },

  // Border Right Widths (br_1 to br_12)
  br_1: { borderRightWidth: 1 },
  br_2: { borderRightWidth: 2 },
  br_3: { borderRightWidth: 3 },
  br_4: { borderRightWidth: 4 },
  br_5: { borderRightWidth: 5 },
  br_6: { borderRightWidth: 6 },
  br_7: { borderRightWidth: 7 },
  br_8: { borderRightWidth: 8 },
  br_9: { borderRightWidth: 9 },
  br_10: { borderRightWidth: 10 },
  br_11: { borderRightWidth: 11 },
  br_12: { borderRightWidth: 12 },

  // Border Bottom Widths (bb_1 to bb_12)
  bb_1: { borderBottomWidth: 1 },
  bb_2: { borderBottomWidth: 2 },
  bb_3: { borderBottomWidth: 3 },
  bb_4: { borderBottomWidth: 4 },
  bb_5: { borderBottomWidth: 5 },
  bb_6: { borderBottomWidth: 6 },
  bb_7: { borderBottomWidth: 7 },
  bb_8: { borderBottomWidth: 8 },
  bb_9: { borderBottomWidth: 9 },
  bb_10: { borderBottomWidth: 10 },
  bb_11: { borderBottomWidth: 11 },
  bb_12: { borderBottomWidth: 12 },

  border1: { borderWidth: 1 },
  border2: { borderWidth: 2 },
  border3: { borderWidth: 3 },
  border4: { borderWidth: 4 },
  border5: { borderWidth: 5 },
  border6: { borderWidth: 6 },
  border7: { borderWidth: 7 },
  border8: { borderWidth: 8 },
  border9: { borderWidth: 9 },
  border10: { borderWidth: 10 },
  border11: { borderWidth: 11 },
  border12: { borderWidth: 12 },
  border13: { borderWidth: 13 },
  border14: { borderWidth: 14 },
  border15: { borderWidth: 15 },
  border16: { borderWidth: 16 },
  border17: { borderWidth: 17 },
  border18: { borderWidth: 18 },
  border19: { borderWidth: 19 },
  border20: { borderWidth: 20 },
  border21: { borderWidth: 21 },
  border22: { borderWidth: 22 },
  border23: { borderWidth: 23 },
  border24: { borderWidth: 24 },
  border25: { borderWidth: 25 },
  border26: { borderWidth: 26 },
  border27: { borderWidth: 27 },
  border28: { borderWidth: 28 },
  border29: { borderWidth: 29 },
  border30: { borderWidth: 30 },
  border31: { borderWidth: 31 },
  border32: { borderWidth: 32 },
  border33: { borderWidth: 33 },
  border34: { borderWidth: 34 },
  border35: { borderWidth: 35 },
  border36: { borderWidth: 36 },
  border37: { borderWidth: 37 },
  border38: { borderWidth: 38 },
  border39: { borderWidth: 39 },
  border40: { borderWidth: 40 },
  border41: { borderWidth: 41 },
  border42: { borderWidth: 42 },
  border43: { borderWidth: 43 },
  border44: { borderWidth: 44 },
  border45: { borderWidth: 45 },
  border46: { borderWidth: 46 },
  border47: { borderWidth: 47 },
  border48: { borderWidth: 48 },
  border49: { borderWidth: 49 },
  border50: { borderWidth: 50 },

  verticalAlignTop: { verticalAlign: 'top' },
  verticalAlignMiddle: { verticalAlign: 'middle' },
  verticalAlignBottom: { verticalAlign: 'bottom' },
  verticalAlignTextTop: { verticalAlign: 'text-top' },
  verticalAlignTextBottom: { verticalAlign: 'text-bottom' },
  verticalAlignSub: { verticalAlign: 'sub' },
  verticalAlignSuper: { verticalAlign: 'super' },
  verticalAlignBaseline: { verticalAlign: 'baseline' },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  menuItemText: {
    color: '#fff',
    fontFamily: theme.font.regular,
    fontSize: 15
  },

  drawerLabel:{
    color: '#fff',
    // fontSize: 14,
    fontFamily: theme.font.regular
  },
  drawerItem:{
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 25,
    borderRadius: theme.radius.md,
    marginVertical: 0,
  },
  fs_1: { fontSize: 12 },
  fs_1_5: { fontSize: 13 },
  fs_2: { fontSize: 14 },
  fs_3: { fontSize: 16 },
  fs_3_5: { fontSize: 17 },
  fs_4: { fontSize: 18 },
  fs_5: { fontSize: 20 },
  fs_6: { fontSize: 22 },
  fs_7: { fontSize: 24 },
  fs_8: { fontSize: 26 },
  fs_9: { fontSize: 28 },
  fs_10: { fontSize: 30 },
  fs_11: { fontSize: 32 },
  fs_12: { fontSize: 34 },
  fs_13: { fontSize: 36 },
  fs_14: { fontSize: 38 },
  fs_15: { fontSize: 40 },
  fs_16: { fontSize: 42 },
  fs_17: { fontSize: 44 },
  fs_18: { fontSize: 46 },
  fs_19: { fontSize: 48 },
  fs_20: { fontSize: 50 },
  fs_21: { fontSize: 52 },
  fs_22: { fontSize: 54 },
  fs_23: { fontSize: 56 },
  fs_24: { fontSize: 58 },
  fs_25: { fontSize: 60 },
  fs_26: { fontSize: 62 },
  fs_27: { fontSize: 64 },
  fs_28: { fontSize: 66 },
  fs_29: { fontSize: 68 },
  fs_30: { fontSize: 70 },
  fs_31: { fontSize: 72 },
  fs_32: { fontSize: 74 },
  fs_33: { fontSize: 76 },
  fs_34: { fontSize: 78 },
  fs_35: { fontSize: 80 },
  fs_36: { fontSize: 82 },
  fs_37: { fontSize: 84 },
  fs_38: { fontSize: 86 },
  fs_39: { fontSize: 88 },
  fs_40: { fontSize: 90 },
  fs_41: { fontSize: 92 },
  fs_42: { fontSize: 94 },
  fs_43: { fontSize: 96 },
  fs_44: { fontSize: 98 },
  fs_45: { fontSize: 100 },
  fs_46: { fontSize: 102 },
  fs_47: { fontSize: 104 },
  fs_48: { fontSize: 106 },
  fs_49: { fontSize: 108 },
  fs_50: { fontSize: 110 },

  fw_1: { fontWeight: 'normal' },
  fw_2: { fontWeight: 'bold' },
  fw_3: { fontWeight: '100' },
  fw_4: { fontWeight: '200' },
  fw_5: { fontWeight: '300' },
  fw_6: { fontWeight: '400' },
  fw_7: { fontWeight: '500' },
  fw_8: { fontWeight: '600' },
  fw_9: { fontWeight: '700' },
  fw_10: { fontWeight: '800' },
  fw_11: { fontWeight: '900' },
  p_0: { padding: 0 },    // padding: 5px
  p_1: { padding: 5 },    // padding: 5px
  p_2: { padding: 10 },   // padding: 10px
  p_3: { padding: 15 },   // padding: 15px
  p_4: { padding: 20 },   // padding: 20px
  p_5: { padding: 25 },   // padding: 25px
  p_6: { padding: 30 },   // padding: 30px
  p_7: { padding: 35 },   // padding: 35px
  p_8: { padding: 40 },   // padding: 40px
  p_9: { padding: 45 },   // padding: 45px
  p_10: { padding: 50 },  // padding: 50px
  p_11: { padding: 55 },  // padding: 55px
  p_12: { padding: 60 },  // padding: 60px

  // Margin
  m_1: { margin: 5 },    // margin: 5px
  m_2: { margin: 10 },   // margin: 10px
  m_3: { margin: 15 },   // margin: 15px
  m_4: { margin: 20 },   // margin: 20px
  m_5: { margin: 25 },   // margin: 25px
  m_6: { margin: 30 },   // margin: 30px
  m_7: { margin: 35 },   // margin: 35px
  m_8: { margin: 40 },   // margin: 40px
  m_9: { margin: 45 },   // margin: 45px
  m_10: { margin: 50 },  // margin: 50px
  m_11: { margin: 55 },  // margin: 55px
  m_12: { margin: 60 },  // margin: 60px

  el_1: { elevation: 5 },
  el_2: { elevation: 10 },
  el_3: { elevation: 15 },
  el_4: { elevation: 20 },
  el_5: { elevation: 25 },
  el_6: { elevation: 30 },
  el_7: { elevation: 35 },
  el_8: { elevation: 40 },
  el_9: { elevation: 45 },
  el_10: { elevation: 50 },
  el_11: { elevation: 55 },
  el_12: { elevation: 60 },
  el_13: { elevation: 65 },
  el_14: { elevation: 70 },
  el_15: { elevation: 75 },
  el_16: { elevation: 80 },
  el_17: { elevation: 85 },
  el_18: { elevation: 90 },
  el_19: { elevation: 95 },
  el_20: { elevation: 100 },
  el_21: { elevation: 105 },
  el_22: { elevation: 110 },
  el_23: { elevation: 115 },
  el_24: { elevation: 120 },
  el_25: { elevation: 125 },
  el_26: { elevation: 130 },
  el_27: { elevation: 135 },
  el_28: { elevation: 140 },
  el_29: { elevation: 145 },
  el_30: { elevation: 150 },
  dropdownButton: {
    padding: 8,
    borderRadius: 5,
  },
  dropdownText: {
    fontSize: 18,
    color: 'white',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 30,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 5,
    width: 120,
    zIndex: 10, // Ensures the dropdown is on top
    elevation: 5, // For Android to bring the dropdown above others
  },
  dropdownOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },

  submitBtn: {
    position: 'absolute',
    right: '5%',
    bottom: '12%',
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: theme.colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 4,
    elevation: 15,
    zIndex: 9,
  },

  logoutButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
  },

  btnPrimary: {
    borderRadius: theme.radius.md,
  },

  btnSecondary: {
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
    color: '#fff',
  },

  btnSuccess: {
    backgroundColor: '#28a745', // Bootstrap success color
    borderColor: '#28a745',
    color: '#fff',
  },

  btnWarning: {
    backgroundColor: '#ffc107', // Bootstrap warning color
    borderColor: '#ffc107',
    color: '#212529',
  },

  btnDanger: {
    borderRadius: theme.radius.md,
  },
});

export default styles2;
