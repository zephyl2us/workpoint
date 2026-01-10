local count = 0
local total_price = 0
local total_win_price = 0
local items = redis.call("ZRANGEBYSCORE", KEYS[1], "-inf", "+inf")

local detail_obj = {}
detail_obj["admin"] = {}
detail_obj["manager"] = {}
detail_obj["smaster"] = {}
detail_obj["master"] = {}

for i = 1, #items, 1 do
  local item = items[i]

  -- local main_id = string.match(item, ".*:detail:([0-9]+).*")
  -- local values = {"c", "d", "e", "f"} -- {'admin_id', 'manager_id', 'smaster_id','master_id'}
  -- local main_data = redis.call("HMGET", "coo:" .. ARGV[1] .. ":record:main:" .. main_id, unpack(values))
  -- local admin_id = main_data[1]
  -- local manager_id = main_data[2]
  -- local smaster_id = main_data[3]
  -- local master_id = main_data[4]

  local values2 = {"n", "h", "i", "j", "k"} -- {'user_id', 'price', 'win_price','dealer_user_id','dealer_type'}
  local item_data = redis.call("HMGET", "coo:" .. item, unpack(values2))
  local user_id = item_data[1]
  local price = item_data[2]
  local win_price = item_data[3]
  local dealer_user_id = item_data[4]
  local dealer_type = item_data[5]

  -- Sum data
  total_price = total_price + price
  total_win_price = total_win_price + win_price

  -- Set index only records win
  redis.call("ZADD", "coo:" .. ARGV[1] .. ":result:record:win", user_id, item)

  -- For prepare payout
  redis.call("HINCRBYFLOAT", "coo:" .. ARGV[1] .. ":result:sum:user:total_win_price", user_id, win_price)
  redis.call("ZINCRBY", "coo:" .. ARGV[1] .. ":result:prepare:payout:index", win_price, user_id)

  -- For Dealer
  redis.call("HINCRBYFLOAT", "coo:" .. ARGV[1] .. ":result:sum:dealer:total_win_price", dealer_user_id, win_price)

  count = count + 1

  -- For report summary admin/manager/smaster/master write in object

  if not detail_obj[dealer_type][dealer_user_id] then
    detail_obj[dealer_type][dealer_user_id] = {}
  end

  if detail_obj[dealer_type][dealer_user_id][ARGV[2]] then
    detail_obj[dealer_type][dealer_user_id][ARGV[2]] =
      detail_obj[dealer_type][dealer_user_id][ARGV[2]] + tonumber(win_price)
  else
    detail_obj[dealer_type][dealer_user_id][ARGV[2]] = tonumber(win_price)
  end
  
end
return {count, tostring(total_price), tostring(total_win_price), cjson.encode(detail_obj)}
