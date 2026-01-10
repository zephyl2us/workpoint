<template>
  <div>
    <div class="d-flex mb-3">
      <div class="btn-group">
        <button 
          v-for="value in sortLists" 
          :key="`sort-${value}`" 
          type="button" 
          class="btn btn-sm" 
          :class="[addClassSortButton(value)]"
          @click="onClickSortButton(value)">
          {{ $t(`lottery.forecast_filter.sorts.${value}`) }}
        </button>
      </div>
      <div class="btn-group ml-3">
        <button 
          v-for="value in showLists" 
          :key="`show-${value}`" 
          type="button" 
          class="btn btn-sm" 
          :class="[addClassShowButton(value)]"
          @click="onClickShowButton(value)">
          {{ $t(`lottery.round`, { amount: value }) }}
        </button>
      </div>
    </div>
    <div class="row row-sm">
      <div v-for="(forecast, index) in forecasts" :key="`forecast-${index}`" class="col-4">
        <div class="card mb-2">
          <div class="d-flex align-items-center px-3 py-3 border-bottom">
            <span class="font-family-special">สูตรที่ {{ forecast.no }}</span>
            <span class="badge font-numeral font-weight-bolder ml-auto" :class="addClassPercent(forecast)">{{ getWinPercent(forecast) | mumeral('0') }}%</span>
            <!-- {{ forecast.win_flow }} -->
          </div>
          <div class="card-body py-2">
            <template v-for="record in forecast.records">
              <div v-if="_.has(record, 'result.three_top')" :key="`forecast-${index}-${record.id}`" class="font-numeral">
                {{ record.round }}.
                <span class="font-weight-bolder text-dark">{{ _.get(record, 'forecast') }}</span> =
                <!-- eslint-disable vue/no-v-html -->
                <span v-html="getResultNumber(record, 'top')"></span> -
                <span v-html="getResultNumber(record, 'under')"></span>
                <!--eslint-enable-->
                <!-- {{ _.get(record, 'result.three_top') }} -
                {{ _.get(record, 'result.two_under') }} -->

                <template v-if="record.forecast_win">
                  <!-- <i class="fa-solid fa-check-double"></i> -->
                  <i class="fa-solid fa-check text-success"></i>
                </template>
                <template v-else>
                  <i class="fa-solid fa-xmark text-danger"></i>
                </template>
              </div>
              <div v-else :key="`forecast-${index}-${record.id}`" class="font-numeral">
                {{ record.round }}.
                <span class="font-weight-bolder text-primary">{{ _.get(record, 'forecast') }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const md5 = require('md5')

export default {
  name: 'ForecastGroup',
  components: {},
  mixins: [],
  props: {
    records: {
      type: Array,
      required: true
    },
    group: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    hunt: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      sortBy: 'hot',
      showCount: 10,
      sortLists: ['name', 'hot', 'coming', 'die'],
      showLists: [5, 10, 15, 20, 25, 30, 40, 50],
      numbers: {
        // Number 2 (45)
        2: [ "01", "02", "03", "04", "05", "06", "07", "08", "09", "12", "13", "14", "15", "16", "17", "18", "19", "23", "24", "25", "26", "27", "28", "29", "34", "35", "36", "37", "38", "39", "45", "46", "47", "48", "49", "56", "57", "58", "59", "67", "68", "69", "78", "79", "89" ],
        // Number 3 (120)
        3: [ "012", "013", "014", "015", "016", "017", "018", "019", "023", "024", "025", "026", "027", "028", "029", "034", "035", "036", "037", "038", "039", "045", "046", "047", "048", "049", "056", "057", "058", "059", "067", "068", "069", "078", "079", "089", "123", "124", "125", "126", "127", "128", "129", "134", "135", "136", "137", "138", "139", "145", "146", "147", "148", "149", "156", "157", "158", "159", "167", "168", "169", "178", "179", "189", "234", "235", "236", "237", "238", "239", "245", "246", "247", "248", "249", "256", "257", "258", "259", "267", "268", "269", "278", "279", "289", "345", "346", "347", "348", "349", "356", "357", "358", "359", "367", "368", "369", "378", "379", "389", "456", "457", "458", "459", "467", "468", "469", "478", "479", "489", "567", "568", "569", "578", "579", "589", "678", "679", "689", "789" ],
        // Number 4 (210)
        4: [ "0123", "0124", "0125", "0126", "0127", "0128", "0129", "0134", "0135", "0136", "0137", "0138", "0139", "0145", "0146", "0147", "0148", "0149", "0156", "0157", "0158", "0159", "0167", "0168", "0169", "0178", "0179", "0189", "0234", "0235", "0236", "0237", "0238", "0239", "0245", "0246", "0247", "0248", "0249", "0256", "0257", "0258", "0259", "0267", "0268", "0269", "0278", "0279", "0289", "0345", "0346", "0347", "0348", "0349", "0356", "0357", "0358", "0359", "0367", "0368", "0369", "0378", "0379", "0389", "0456", "0457", "0458", "0459", "0467", "0468", "0469", "0478", "0479", "0489", "0567", "0568", "0569", "0578", "0579", "0589", "0678", "0679", "0689", "0789", "1234", "1235", "1236", "1237", "1238", "1239", "1245", "1246", "1247", "1248", "1249", "1256", "1257", "1258", "1259", "1267", "1268", "1269", "1278", "1279", "1289", "1345", "1346", "1347", "1348", "1349", "1356", "1357", "1358", "1359", "1367", "1368", "1369", "1378", "1379", "1389", "1456", "1457", "1458", "1459", "1467", "1468", "1469", "1478", "1479", "1489", "1567", "1568", "1569", "1578", "1579", "1589", "1678", "1679", "1689", "1789", "2345", "2346", "2347", "2348", "2349", "2356", "2357", "2358", "2359", "2367", "2368", "2369", "2378", "2379", "2389", "2456", "2457", "2458", "2459", "2467", "2468", "2469", "2478", "2479", "2489", "2567", "2568", "2569", "2578", "2579", "2589", "2678", "2679", "2689", "2789", "3456", "3457", "3458", "3459", "3467", "3468", "3469", "3478", "3479", "3489", "3567", "3568", "3569", "3578", "3579", "3589", "3678", "3679", "3689", "3789", "4567", "4568", "4569", "4578", "4579", "4589", "4678", "4679", "4689", "4789", "5678", "5679", "5689", "5789", "6789" ],
        // Number 5 (252)
        5: [ "01234", "01235", "01236", "01237", "01238", "01239", "01245", "01246", "01247", "01248", "01249", "01256", "01257", "01258", "01259", "01267", "01268", "01269", "01278", "01279", "01289", "01345", "01346", "01347", "01348", "01349", "01356", "01357", "01358", "01359", "01367", "01368", "01369", "01378", "01379", "01389", "01456", "01457", "01458", "01459", "01467", "01468", "01469", "01478", "01479", "01489", "01567", "01568", "01569", "01578", "01579", "01589", "01678", "01679", "01689", "01789", "02345", "02346", "02347", "02348", "02349", "02356", "02357", "02358", "02359", "02367", "02368", "02369", "02378", "02379", "02389", "02456", "02457", "02458", "02459", "02467", "02468", "02469", "02478", "02479", "02489", "02567", "02568", "02569", "02578", "02579", "02589", "02678", "02679", "02689", "02789", "03456", "03457", "03458", "03459", "03467", "03468", "03469", "03478", "03479", "03489", "03567", "03568", "03569", "03578", "03579", "03589", "03678", "03679", "03689", "03789", "04567", "04568", "04569", "04578", "04579", "04589", "04678", "04679", "04689", "04789", "05678", "05679", "05689", "05789", "06789", "12345", "12346", "12347", "12348", "12349", "12356", "12357", "12358", "12359", "12367", "12368", "12369", "12378", "12379", "12389", "12456", "12457", "12458", "12459", "12467", "12468", "12469", "12478", "12479", "12489", "12567", "12568", "12569", "12578", "12579", "12589", "12678", "12679", "12689", "12789", "13456", "13457", "13458", "13459", "13467", "13468", "13469", "13478", "13479", "13489", "13567", "13568", "13569", "13578", "13579", "13589", "13678", "13679", "13689", "13789", "14567", "14568", "14569", "14578", "14579", "14589", "14678", "14679", "14689", "14789", "15678", "15679", "15689", "15789", "16789", "23456", "23457", "23458", "23459", "23467", "23468", "23469", "23478", "23479", "23489", "23567", "23568", "23569", "23578", "23579", "23589", "23678", "23679", "23689", "23789", "24567", "24568", "24569", "24578", "24579", "24589", "24678", "24679", "24689", "24789", "25678", "25679", "25689", "25789", "26789", "34567", "34568", "34569", "34578", "34579", "34589", "34678", "34679", "34689", "34789", "35678", "35679", "35689", "35789", "36789", "45678", "45679", "45689", "45789", "46789", "56789" ],
        // Number 6 (210)
        6: [ "012345", "012346", "012347", "012348", "012349", "012356", "012357", "012358", "012359", "012367", "012368", "012369", "012378", "012379", "012389", "012456", "012457", "012458", "012459", "012467", "012468", "012469", "012478", "012479", "012489", "012567", "012568", "012569", "012578", "012579", "012589", "012678", "012679", "012689", "012789", "013456", "013457", "013458", "013459", "013467", "013468", "013469", "013478", "013479", "013489", "013567", "013568", "013569", "013578", "013579", "013589", "013678", "013679", "013689", "013789", "014567", "014568", "014569", "014578", "014579", "014589", "014678", "014679", "014689", "014789", "015678", "015679", "015689", "015789", "016789", "023456", "023457", "023458", "023459", "023467", "023468", "023469", "023478", "023479", "023489", "023567", "023568", "023569", "023578", "023579", "023589", "023678", "023679", "023689", "023789", "024567", "024568", "024569", "024578", "024579", "024589", "024678", "024679", "024689", "024789", "025678", "025679", "025689", "025789", "026789", "034567", "034568", "034569", "034578", "034579", "034589", "034678", "034679", "034689", "034789", "035678", "035679", "035689", "035789", "036789", "045678", "045679", "045689", "045789", "046789", "056789", "123456", "123457", "123458", "123459", "123467", "123468", "123469", "123478", "123479", "123489", "123567", "123568", "123569", "123578", "123579", "123589", "123678", "123679", "123689", "123789", "124567", "124568", "124569", "124578", "124579", "124589", "124678", "124679", "124689", "124789", "125678", "125679", "125689", "125789", "126789", "134567", "134568", "134569", "134578", "134579", "134589", "134678", "134679", "134689", "134789", "135678", "135679", "135689", "135789", "136789", "145678", "145679", "145689", "145789", "146789", "156789", "234567", "234568", "234569", "234578", "234579", "234589", "234678", "234679", "234689", "234789", "235678", "235679", "235689", "235789", "236789", "245678", "245679", "245689", "245789", "246789", "256789", "345678", "345679", "345689", "345789", "346789", "356789", "456789" ],
        // Number 7 (120)
        7: [ "0123456", "0123457", "0123458", "0123459", "0123467", "0123468", "0123469", "0123478", "0123479", "0123489", "0123567", "0123568", "0123569", "0123578", "0123579", "0123589", "0123678", "0123679", "0123689", "0123789", "0124567", "0124568", "0124569", "0124578", "0124579", "0124589", "0124678", "0124679", "0124689", "0124789", "0125678", "0125679", "0125689", "0125789", "0126789", "0134567", "0134568", "0134569", "0134578", "0134579", "0134589", "0134678", "0134679", "0134689", "0134789", "0135678", "0135679", "0135689", "0135789", "0136789", "0145678", "0145679", "0145689", "0145789", "0146789", "0156789", "0234567", "0234568", "0234569", "0234578", "0234579", "0234589", "0234678", "0234679", "0234689", "0234789", "0235678", "0235679", "0235689", "0235789", "0236789", "0245678", "0245679", "0245689", "0245789", "0246789", "0256789", "0345678", "0345679", "0345689", "0345789", "0346789", "0356789", "0456789", "1234567", "1234568", "1234569", "1234578", "1234579", "1234589", "1234678", "1234679", "1234689", "1234789", "1235678", "1235679", "1235689", "1235789", "1236789", "1245678", "1245679", "1245689", "1245789", "1246789", "1256789", "1345678", "1345679", "1345689", "1345789", "1346789", "1356789", "1456789", "2345678", "2345679", "2345689", "2345789", "2346789", "2356789", "2456789", "3456789" ],
        // Number 8 (45)
        8: [ "01234567", "01234568", "01234569", "01234578", "01234579", "01234589", "01234678", "01234679", "01234689", "01234789", "01235678", "01235679", "01235689", "01235789", "01236789", "01245678", "01245679", "01245689", "01245789", "01246789", "01256789", "01345678", "01345679", "01345689", "01345789", "01346789", "01356789", "01456789", "02345678", "02345679", "02345689", "02345789", "02346789", "02356789", "02456789", "03456789", "12345678", "12345679", "12345689", "12345789", "12346789", "12356789", "12456789", "13456789", "23456789" ],
        // Number 9 (10)
        9: [ "12345678", "12345679", "12345689", "12345789", "12346789", "12356789", "12456789", "13456789", "23456789", "123456789" ],
      },
      types: {
        run_1:              { forecast_amount: 100, number_amount: 1, is_random: true },
        run_2:              { forecast_amount: 100, number_amount: 2, is_random: true },
        run_1_top:          { forecast_amount: 100, number_amount: 1, is_random: true },
        run_2_top:          { forecast_amount: 100, number_amount: 2, is_random: true },
        run_1_under:        { forecast_amount: 100, number_amount: 1, is_random: true },
        run_2_under:        { forecast_amount: 100, number_amount: 2, is_random: true },
        slide_1:            { forecast_amount: 100, number_amount: 1, is_random: true },
        slide_2:            { forecast_amount: 100, number_amount: 2, is_random: true },
        slide_1_top:        { forecast_amount: 100, number_amount: 1, is_random: true },
        slide_2_top:        { forecast_amount: 100, number_amount: 2, is_random: true },
        slide_3_top:        { forecast_amount: 100, number_amount: 3, is_random: true },
        slide_4_top:        { forecast_amount: 100, number_amount: 4, is_random: true },
        slide_1_under:      { forecast_amount: 100, number_amount: 1, is_random: true },
        slide_2_under:      { forecast_amount: 100, number_amount: 2, is_random: true },
        slide_3_under:      { forecast_amount: 100, number_amount: 3, is_random: true },
        slide_4_under:      { forecast_amount: 100, number_amount: 4, is_random: true },
        three_win_5:        { forecast_amount: 100, number_amount: 5, is_random: true },
        three_win_6:        { forecast_amount: 100, number_amount: 6, is_random: true },
        three_win_7:        { forecast_amount: 100, number_amount: 7, is_random: true },
        three_win_8:        { forecast_amount: 100, number_amount: 8, is_random: true },
        win_5:              { forecast_amount: 100, number_amount: 5, is_random: true },
        win_6:              { forecast_amount: 100, number_amount: 6, is_random: true },
        win_7:              { forecast_amount: 100, number_amount: 7, is_random: true },
        win_8:              { forecast_amount: 100, number_amount: 8, is_random: true },
        win_9:              { forecast_amount: 100, number_amount: 9, is_random: true },
        win_5_top:          { forecast_amount: 100, number_amount: 5, is_random: true },
        win_6_top:          { forecast_amount: 100, number_amount: 6, is_random: true },
        win_7_top:          { forecast_amount: 100, number_amount: 7, is_random: true },
        win_8_top:          { forecast_amount: 100, number_amount: 8, is_random: true },
        win_9_top:          { forecast_amount: 100, number_amount: 9, is_random: true },
        win_5_under:        { forecast_amount: 100, number_amount: 5, is_random: true },
        win_6_under:        { forecast_amount: 100, number_amount: 6, is_random: true },
        win_7_under:        { forecast_amount: 100, number_amount: 7, is_random: true },
        win_8_under:        { forecast_amount: 100, number_amount: 8, is_random: true },
        win_9_under:        { forecast_amount: 100, number_amount: 9, is_random: true },
        high_low_top:       { forecast_amount: 100, number_amount: 1, is_random: true },
        high_low_under:     { forecast_amount: 100, number_amount: 1, is_random: true },
        high_low_top_flow:  { forecast_amount: 2, number_amount: 1, is_random: false },
        high_low_under_flow: { forecast_amount: 2, number_amount: 1, is_random: false },
        even_odd_top:       { forecast_amount: 100, number_amount: 1, is_random: true },
        even_odd_under:     { forecast_amount: 100, number_amount: 1, is_random: true },
        even_odd_top_flow:  { forecast_amount: 2, number_amount: 1, is_random: false },
        even_odd_under_flow: { forecast_amount: 2, number_amount: 1, is_random: false },
        sticky_ones_5_top:  { forecast_amount: 100, number_amount: 5, is_random: true },
        sticky_ones_6_top:  { forecast_amount: 100, number_amount: 6, is_random: true },
        sticky_ones_7_top:  { forecast_amount: 100, number_amount: 7, is_random: true },
        sticky_ones_8_top:  { forecast_amount: 100, number_amount: 8, is_random: true },
        sticky_ones_9_top:  { forecast_amount: 100, number_amount: 9, is_random: true },
        sticky_tens_5_top:  { forecast_amount: 100, number_amount: 5, is_random: true },
        sticky_tens_6_top:  { forecast_amount: 100, number_amount: 6, is_random: true },
        sticky_tens_7_top:  { forecast_amount: 100, number_amount: 7, is_random: true },
        sticky_tens_8_top:  { forecast_amount: 100, number_amount: 8, is_random: true },
        sticky_tens_9_top:  { forecast_amount: 100, number_amount: 9, is_random: true },
        sticky_hundreds_5_top:  { forecast_amount: 100, number_amount: 5, is_random: true },
        sticky_hundreds_6_top:  { forecast_amount: 100, number_amount: 6, is_random: true },
        sticky_hundreds_7_top:  { forecast_amount: 100, number_amount: 7, is_random: true },
        sticky_hundreds_8_top:  { forecast_amount: 100, number_amount: 8, is_random: true },
        sticky_hundreds_9_top:  { forecast_amount: 100, number_amount: 9, is_random: true },
        sticky_ones_5_under:  { forecast_amount: 100, number_amount: 5, is_random: true },
        sticky_ones_6_under:  { forecast_amount: 100, number_amount: 6, is_random: true },
        sticky_ones_7_under:  { forecast_amount: 100, number_amount: 7, is_random: true },
        sticky_ones_8_under:  { forecast_amount: 100, number_amount: 8, is_random: true },
        sticky_ones_9_under:  { forecast_amount: 100, number_amount: 9, is_random: true },
        sticky_tens_5_under:  { forecast_amount: 100, number_amount: 5, is_random: true },
        sticky_tens_6_under:  { forecast_amount: 100, number_amount: 6, is_random: true },
        sticky_tens_7_under:  { forecast_amount: 100, number_amount: 7, is_random: true },
        sticky_tens_8_under:  { forecast_amount: 100, number_amount: 8, is_random: true },
        sticky_tens_9_under:  { forecast_amount: 100, number_amount: 9, is_random: true },
        fixed_run_2:          { forecast_amount: 45, number_amount: 2, is_random: false },
        fixed_run_2_top:      { forecast_amount: 45, number_amount: 2, is_random: false },
        fixed_run_2_under:    { forecast_amount: 45, number_amount: 2, is_random: false },
        fixed_slide_2:        { forecast_amount: 45, number_amount: 2, is_random: false },
        fixed_slide_2_top:    { forecast_amount: 45, number_amount: 2, is_random: false },
        fixed_slide_3_top:    { forecast_amount: 120, number_amount: 3, is_random: false },
        fixed_slide_4_top:    { forecast_amount: 210, number_amount: 4, is_random: false },
        fixed_slide_2_under:  { forecast_amount: 45, number_amount: 2, is_random: false },
        fixed_slide_3_under:  { forecast_amount: 120, number_amount: 3, is_random: false },
        fixed_slide_4_under:  { forecast_amount: 210, number_amount: 4, is_random: false },
        fixed_win_5:          { forecast_amount: 252, number_amount: 5, is_random: false },
        fixed_win_6:          { forecast_amount: 210, number_amount: 6, is_random: false },
        fixed_win_7:          { forecast_amount: 120, number_amount: 7, is_random: false },
        fixed_win_8:          { forecast_amount: 45, number_amount: 8, is_random: false },
        fixed_win_9:          { forecast_amount: 10, number_amount: 9, is_random: false },
        fixed_win_5_top:      { forecast_amount: 252, number_amount: 5, is_random: false },
        fixed_win_6_top:      { forecast_amount: 210, number_amount: 6, is_random: false },
        fixed_win_7_top:      { forecast_amount: 120, number_amount: 7, is_random: false },
        fixed_win_8_top:      { forecast_amount: 45, number_amount: 8, is_random: false },
        fixed_win_9_top:      { forecast_amount: 10, number_amount: 9, is_random: false },
        fixed_win_5_under:    { forecast_amount: 252, number_amount: 5, is_random: false },
        fixed_win_6_under:    { forecast_amount: 210, number_amount: 6, is_random: false },
        fixed_win_7_under:    { forecast_amount: 120, number_amount: 7, is_random: false },
        fixed_win_8_under:    { forecast_amount: 45, number_amount: 8, is_random: false },
        fixed_win_9_under:    { forecast_amount: 10, number_amount: 9, is_random: false },
        fixed_sticky_ones_5_top:      { forecast_amount: 252, number_amount: 5, is_random: false },
        fixed_sticky_ones_6_top:      { forecast_amount: 210, number_amount: 6, is_random: false },
        fixed_sticky_ones_7_top:      { forecast_amount: 120, number_amount: 7, is_random: false },
        fixed_sticky_ones_8_top:      { forecast_amount: 45, number_amount: 8, is_random: false },
        fixed_sticky_tens_5_top:      { forecast_amount: 252, number_amount: 5, is_random: false },
        fixed_sticky_tens_6_top:      { forecast_amount: 210, number_amount: 6, is_random: false },
        fixed_sticky_tens_7_top:      { forecast_amount: 120, number_amount: 7, is_random: false },
        fixed_sticky_tens_8_top:      { forecast_amount: 45, number_amount: 8, is_random: false },
        fixed_sticky_hundreds_5_top:  { forecast_amount: 252, number_amount: 5, is_random: false },
        fixed_sticky_hundreds_6_top:  { forecast_amount: 210, number_amount: 6, is_random: false },
        fixed_sticky_hundreds_7_top:  { forecast_amount: 120, number_amount: 7, is_random: false },
        fixed_sticky_hundreds_8_top:  { forecast_amount: 45, number_amount: 8, is_random: false },
        fixed_sticky_ones_5_under:    { forecast_amount: 252, number_amount: 5, is_random: false },
        fixed_sticky_ones_6_under:    { forecast_amount: 210, number_amount: 6, is_random: false },
        fixed_sticky_ones_7_under:    { forecast_amount: 120, number_amount: 7, is_random: false },
        fixed_sticky_ones_8_under:    { forecast_amount: 45, number_amount: 8, is_random: false },
        fixed_sticky_tens_5_under:    { forecast_amount: 252, number_amount: 5, is_random: false },
        fixed_sticky_tens_6_under:    { forecast_amount: 210, number_amount: 6, is_random: false },
        fixed_sticky_tens_7_under:    { forecast_amount: 120, number_amount: 7, is_random: false },
        fixed_sticky_tens_8_under:    { forecast_amount: 45, number_amount: 8, is_random: false },
        // flow
      }
    }
  },
  computed: {
    // forecastAmount () {
    //   return this._.get(this.types, `${this.type}.forecast_amount`)
    // },
    rounds () {
      const comingRounds = this._.filter(this.records, (lottery) => !this._.isObject(lottery.result))
      const comingSize = this._.size(comingRounds)

      return this._.slice(this.records, (this.showCount + comingSize) * -1)
    },
    config () {
      const forecastType = this.type
      return this._.get(this.types, `${forecastType}`)
    },
    forecasts () {
      const config = this.config
      const forecastAmount = this._.get(config, `forecast_amount`)

      // eslint-disable-next-line prefer-const
      let forecasts = []
      for(let i = 0; i < forecastAmount; i++) {
        const forecastNo = (i + 1)
        
        // eslint-disable-next-line prefer-const
        let rounds = []
        let winCount = 0
        let winFlow = 0
        // let sumResult
        this._.each(this.rounds, (obj) => {
          const forecast = this.generateRound(obj, forecastNo)
          
          const isWin = forecast.is_win

          if(isWin) {
            winCount++
          }

          if(this._.isObject(obj.result)) {
            if(isWin) {
              if(winFlow >= 0) winFlow += 1
              else winFlow = 1
            } else {
              // eslint-disable-next-line no-lonely-if
              if(winFlow <= 0) winFlow -= 1
              else winFlow = -1
            }
          }
          // console.log(`Result:`, forecast)

          rounds.push(forecast.round)
        })

        forecasts.push({
          no: forecastNo,
          records: rounds,
          win_count: winCount,
          win_flow: winFlow
        })
      }

      if(this._.eq(this.sortBy, 'hot')) {
        forecasts = this._.orderBy(forecasts, ['win_count'], ['desc'])
      } else if(this._.eq(this.sortBy, 'die')) {
        forecasts = this._.orderBy(forecasts, ['win_count'], ['asc'])
      } else if(this._.eq(this.sortBy, 'coming')) {
        forecasts = this._.orderBy(forecasts, ['win_flow'], ['desc'])
      }

      return forecasts
    }
  },
  watch: {},
  created () {},
  mounted () {
  },
  methods: {
    addClassSortButton (value) {
      return this._.eq(this.sortBy, value) ? 'btn-primary': 'btn-light-secondary'
    },
    onClickSortButton (value) {
      this.sortBy = value
    },
    addClassShowButton (value) {
      return this._.eq(this.showCount, value) ? 'btn-primary': 'btn-light-secondary'
    },
    onClickShowButton (value) {
      this.showCount = value
    },
    getResultNumber (record, type) {
      // console.log(record)
      let html = ``
      const results = this._.get(record, `forecast_result.${type}`)
      const spanClass = `text-success`
      this._.each(results, (result, key) => {
        html += `<span class="${result.status ? spanClass : ''}">${result.number}</span>`
      })
      return html
    },
    getWinPercent (forecast) {
      
      const resultedRounds = this._.filter(this.rounds, (lottery) => this._.isObject(lottery.result))
      const resultedSize = this._.size(resultedRounds)

      const winCount= this._.get(forecast, 'win_count')
      return winCount * 100 / resultedSize
    },
    addClassPercent (forecast) {
      const winPercent = this.getWinPercent(forecast)
      return winPercent >= 50 ? 'badge-success' : 'badge-light-secondary'
    },
    generateRound (obj, no) {
      const forecastGroup = this.group
      const forecastType = this.type

      const forecast = this.generateForecast(obj, no)
      const forecastResult = this.generateResult(obj, forecast)

      let isWin = false

      if(this._.eq('three_win', forecastGroup)) {
        //
        const winForecast = this.sumWinForecastAllThree(forecastResult)
        isWin = !!winForecast

      } else if(this._.eq('win', forecastGroup) || 
      this._.size(this._.words(forecastType, /^fixed_win_/))) {
        //
        const replaceType = this._.replace(forecastType, 'fixed_', '')
        if(this._.includes(['win_5_top', 'win_6_top', 'win_7_top', 'win_8_top'], replaceType)) {
          const winForecast = this.sumWinForecastAllTwo(forecastResult, 'top')
          isWin = !!winForecast
        } else if(this._.includes(['win_5_under', 'win_6_under', 'win_7_under', 'win_8_under'], replaceType)) {
          const winForecast = this.sumWinForecastAllTwo(forecastResult, 'under')
          isWin = !!winForecast
        } else {
          const winForecast = this.sumWinForecastAllTwo(forecastResult)
          isWin = !!winForecast
        }

      } else {
        const winForecast = this.sumWinForecast(forecastResult)
        isWin = !!winForecast
      }

      const round = {
        id: obj.id,
        date: obj.date,
        slug: obj.slug,
        round: obj.round,
        result: obj.result,
        forecast,
        forecast_result: forecastResult,
        forecast_win: isWin,
      }

      return {
        is_win: isWin,
        round
      }
    },
    generateForecast (obj, forecastNo) {
      const config = this.config
      const isRandom = this._.get(config, 'is_random')
      const numberAmount = this._.get(config, 'number_amount')

      const forecastGroup = this.group
      const forecastType = this.type
      const roundHunt = `${this.hunt}_` + Math.floor((obj.round-1) / this.hunt)
      const key = `${obj.date}-${obj.slug}-${forecastType}-${forecastNo}-${roundHunt}` // 2023-06-11-lottoone_yeekee-10-run_1-75
      const keyToMd5 = md5(key) // 3e7f3eff276fbc2d16b2c0954acdc27e
      const sliceKey = keyToMd5.slice(1, 12) // 7f3eff276f
      const keyToDecimal = parseInt(sliceKey, 16) + '' // 546517755759
      // console.log(key)
      // console.log(`MD5:`, keyToMd5)
      // console.log(`sliceKey:`, sliceKey)
      // console.log(`Decimal:`, keyToDecimal)
      
      let conjecture = forecastNo + ''
      if(isRandom) {
        conjecture = keyToDecimal
      }

      // conjecture = conjecture.slice(numberAmount * -1)
      conjecture = conjecture.slice(-1)

      if(numberAmount > 1) {
        for (let i = 1; i < numberAmount; i++) {
          const number = (parseInt(conjecture) + 1) % 10
          conjecture += number
        }
      }

      if(this._.eq('high_low', forecastGroup)) {
        conjecture = (parseInt(conjecture) + 1) % 2 === 0 ?'high' : 'low'
      } else if(this._.eq('even_odd', forecastGroup)) {
        conjecture = (parseInt(conjecture) + 1) % 2 === 0 ?'even' : 'odd'
      }

      if(this._.eq('fixed', forecastGroup)) {
        const index = forecastNo - 1
        const numbers = this.numbers[numberAmount]
        conjecture = numbers[index]
      }

      return conjecture

    },
    sumWinForecast (result) {
      const top = this._.get(result, 'top')
      const under = this._.get(result, 'under')

      const allResult = this._.concat(top, under)
      const winResult = this._.filter(allResult, ['status', true])
      const winCount = this._.size(winResult)
      
      return winCount
    },
    sumWinForecastAllThree (result) {
      const top = this._.get(result, 'top')
      const winResult = this._.filter(top, ['status', true])
      const winCount = this._.size(winResult)

      return winCount === 3 ? 1 : 0
    },
    sumWinForecastAllTwo (result, onlyType = null) {
      const top = this._.get(result, 'top')
      const under = this._.get(result, 'under')

      const splitTop = this._.slice(top, -2)
      const splitUnder = this._.slice(under, -2)

      const winResultTop = this._.filter(splitTop, ['status', true])
      const winCountTop = this._.size(winResultTop)
      const winResultUnder = this._.filter(splitUnder, ['status', true])
      const winCountUnder = this._.size(winResultUnder)

      let winCount = 0

      if(this._.isNull(onlyType) || this._.eq('top', onlyType)) {
        winCount += winCountTop === 2 ? 1 : 0
      }
      if(this._.isNull(onlyType) || this._.eq('under', onlyType)) {
        winCount += winCountUnder === 2 ? 1 : 0
      }

      return winCount
    },
    generateResult (obj, forecast) {
      const result = obj.result

      if(!this._.isObject(result)) {
        return null
      }

      // const config = this.config
      const forecastGroup = this.group
      const forecastType = this.type
      // const resultType = this._.get(config, 'result_type')
      // const resultIdentify = this._.get(config, 'result_identify')

      const threeTop = this._.get(result, 'three_top')
      const splitThreeTop = this._.split(threeTop, '')
      const top = this._.map(splitThreeTop, (value) => {
        return {
          number: value,
          status: false
        }
      })
      
      const twoUnder = this._.get(result, 'two_under')
      const splitTwoUnder = this._.split(twoUnder, '')
      const under = this._.map(splitTwoUnder, (value) => {
        return {
          number: value,
          status: false
        }
      })
      // eslint-disable-next-line prefer-const, no-unused-vars
      const forecastResult = {top, under}

      if(this._.eq(forecastGroup, 'run') || 
      this._.size(this._.words(forecastType, /^fixed_run_/))) {
        const replaceType = this._.replace(forecastType, 'fixed_', '')

        if(this._.includes([
          'run_1', 'run_2', 'run_1_top', 'run_2_top'
        ], replaceType)) {
          const splitForecast = this._.split(forecast, '')
          this._.each(splitThreeTop, (num, index) => {
            if(this._.includes(splitForecast, num)) {
              // console.log(index, num)
              forecastResult.top[index].status = true
            }
          })
        }

        if(this._.includes([
          'run_1', 'run_2', 'run_1_under', 'run_2_under'
        ], replaceType)) {
          const splitForecast = this._.split(forecast, '')
          this._.each(splitTwoUnder, (num, index) => {
            if(this._.includes(splitForecast, num)) {
              // console.log(index, num)
              forecastResult.under[index].status = true
            }
          })
        }
        
      } else if(this._.eq(forecastGroup, 'slide') || 
      this._.size(this._.words(forecastType, /^fixed_slide_/))) {
        const replaceType = this._.replace(forecastType, 'fixed_', '')

        if(this._.includes([
          'slide_1', 'slide_2', 'slide_1_top', 'slide_2_top', 'slide_3_top', 'slide_4_top'
        ], replaceType)) {
          const splitForecast = this._.split(forecast, '')
          this._.each(splitThreeTop, (num, index) => {
            if(index === 0) return
            if(this._.includes(splitForecast, num)) {
              // console.log(index, num)
              forecastResult.top[index].status = true
            }
          })
        }

        if(this._.includes([
          'slide_1', 'slide_2', 'slide_1_under', 'slide_2_under', 'slide_3_under', 'slide_4_under'
        ], replaceType)) {
          const splitForecast = this._.split(forecast, '')
          this._.each(splitTwoUnder, (num, index) => {
            if(this._.includes(splitForecast, num)) {
              // console.log(index, num)
              forecastResult.under[index].status = true
            }
          })
        }
      } else if(this._.eq(forecastGroup, 'three_win')) {
        const splitForecast = this._.split(forecast, '')
        this._.each(splitThreeTop, (num, index) => {
          if(this._.includes(splitForecast, num)) {
            // console.log(index, num)
            forecastResult.top[index].status = true
          }
        })
      } else if(this._.eq(forecastGroup, 'win') || 
      this._.size(this._.words(forecastType, /^fixed_win_/))) {
        const replaceType = this._.replace(forecastType, 'fixed_', '')

        if(this._.includes([
          'win_5', 'win_6', 'win_7', 'win_8', 'win_9', 
          'win_5_top', 'win_6_top', 'win_7_top', 'win_8_top', 'win_9_top'
        ], replaceType)) {
          const splitForecast = this._.split(forecast, '')
          this._.each(splitThreeTop, (num, index) => {
            if(index === 0) return
            if(this._.includes(splitForecast, num)) {
              // console.log(index, num)
              forecastResult.top[index].status = true
            }
          })
        }

        if(this._.includes([
          'win_5', 'win_6', 'win_7', 'win_8', 'win_9', 
          'win_5_under', 'win_6_under', 'win_7_under', 'win_8_under', 'win_9_under'
        ], replaceType)) {
          const splitForecast = this._.split(forecast, '')
          this._.each(splitTwoUnder, (num, index) => {
            if(this._.includes(splitForecast, num)) {
              // console.log(index, num)
              forecastResult.under[index].status = true
            }
          })
        }
      } else if(this._.eq(forecastGroup, 'high_low')) {
        const isForecastHigh = forecast === 'high'
        
        if(this._.includes(['high_low_top', 'high_low_top_flow'], forecastType)) {
          const isResultHigh = (parseInt(threeTop) % 100) >= 50
          if(isForecastHigh === isResultHigh) {
            this._.each(splitThreeTop, (num, index) => {
              if(index === 0) return
              forecastResult.top[index].status = true
            })
          }
        }

        if(this._.includes(['high_low_under', 'high_low_under_flow'], forecastType)) {
          const isResultHigh = (parseInt(twoUnder) % 100) >= 50
          if(isForecastHigh === isResultHigh) {
            this._.each(splitTwoUnder, (num, index) => {
              forecastResult.under[index].status = true
            })
          }
        }
      } else if(this._.eq(forecastGroup, 'even_odd')) {
        const isForecastEven = forecast === 'even'
        
        if(this._.includes(['even_odd_top', 'even_odd_top_flow'], forecastType)) {
          const isResultEven = (parseInt(threeTop) % 2) === 0
          if(isForecastEven === isResultEven) {
            this._.each(splitThreeTop, (num, index) => {
              if(index === 0) return
              forecastResult.top[index].status = true
            })
          }
        }

        if(this._.includes(['even_odd_under', 'even_odd_under_flow'], forecastType)) {
          const isResultEven = (parseInt(twoUnder) % 2) === 0
          if(isForecastEven === isResultEven) {
            this._.each(splitTwoUnder, (num, index) => {
              forecastResult.under[index].status = true
            })
          }
        }
      } else if(this._.eq(forecastGroup, 'sticky') || 
      this._.size(this._.words(forecastType, /^fixed_sticky_/))) {

        const splitForecast = this._.split(forecast, '')

        let index = null
        if(this._.size(this._.words(forecastType, "_top"))) {
          if(this._.size(this._.words(forecastType, "_hundreds_"))) {
            index = 0
          } else if(this._.size(this._.words(forecastType, "_tens_"))) {
            index = 1
          } else {
            index = 2
          }

          const num = splitThreeTop[index]
          if(this._.includes(splitForecast, num)) {
            // console.log(index, num)
            forecastResult.top[index].status = true
          }

        }
        if(this._.size(this._.words(forecastType, "_under"))) {
          if(this._.size(this._.words(forecastType, "_tens_"))) {
            index = 0
          } else {
            index = 1
          }

          const num = splitTwoUnder[index]
          if(this._.includes(splitForecast, num)) {
            // console.log(index, num)
            forecastResult.under[index].status = true
          }
        }
      }

      return forecastResult
    }
  },
}
</script>