local count = 0
local total_price = 0
local total_win_price = 0
local items = redis.call("ZRANGEBYSCORE", KEYS[1], "-inf", "+inf")

local detail_obj = {}
detail_obj["manager"] = {}
detail_obj["smaster"] = {}
detail_obj["master"] = {}
detail_obj["agent"] = {}

for i = 1, #items, 1 do
  local item = items[i]

  local main_id = string.match(item, ".*:detail:([0-9]+).*")
  local values = {"d", "e", "f", "g"} -- {'manager_id', 'smaster_id','master_id', 'agent_id'}
  local main_data = redis.call("HMGET", "coo:" .. ARGV[1] .. ":record:main:" .. main_id, unpack(values))
  local manager_id = main_data[1]
  local smaster_id = main_data[2]
  local master_id = main_data[3]
  local agent_id = main_data[4]

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

  -- For report summary manager/smaster/master/agent write in object
  -- manager
  if dealer_type == "master" or dealer_type == "smaster" or dealer_type == "manager" then
    if not detail_obj["manager"][manager_id] then
      detail_obj["manager"][manager_id] = {}
    end

    if detail_obj["manager"][manager_id][ARGV[2]] then
      detail_obj["manager"][manager_id][ARGV[2]] = detail_obj["manager"][manager_id][ARGV[2]] + tonumber(win_price)
    else
      detail_obj["manager"][manager_id][ARGV[2]] = tonumber(win_price)
    end
  end

  -- smaster
  if dealer_type == "master" or dealer_type == "smaster" then
    if not detail_obj["smaster"][manager_id .. ":" .. smaster_id] then
      detail_obj["smaster"][manager_id .. ":" .. smaster_id] = {}
    end

    if detail_obj["smaster"][manager_id .. ":" .. smaster_id][ARGV[2]] then
      detail_obj["smaster"][manager_id .. ":" .. smaster_id][ARGV[2]] =
        detail_obj["smaster"][manager_id .. ":" .. smaster_id][ARGV[2]] + tonumber(win_price)
    else
      detail_obj["smaster"][manager_id .. ":" .. smaster_id][ARGV[2]] = tonumber(win_price)
    end
  end
  -- master
  if dealer_type == "master" then
    if not detail_obj["master"][manager_id .. ":" .. smaster_id .. ":" .. master_id] then
      detail_obj["master"][manager_id .. ":" .. smaster_id .. ":" .. master_id] = {}
    end

    if detail_obj["master"][manager_id .. ":" .. smaster_id .. ":" .. master_id][ARGV[2]] then
      detail_obj["master"][manager_id .. ":" .. smaster_id .. ":" .. master_id][ARGV[2]] =
        detail_obj["master"][manager_id .. ":" .. smaster_id .. ":" .. master_id][ARGV[2]] + tonumber(win_price)
    else
      detail_obj["master"][manager_id .. ":" .. smaster_id .. ":" .. master_id][ARGV[2]] = tonumber(win_price)
    end
  end
  -- agent
  -- if dealer_type == "agent" then
  --   if not detail_obj["agent"][manager_id .. ":" .. smaster_id .. ":" .. master_id .. ":" .. agent_id] then
  --     detail_obj["agent"][manager_id .. ":" .. smaster_id .. ":" .. master_id .. ":" .. agent_id] = {}
  --   end

  --   if detail_obj["agent"][manager_id .. ":" .. smaster_id .. ":" .. master_id .. ":" .. agent_id][ARGV[2]] then
  --     detail_obj["agent"][manager_id .. ":" .. smaster_id .. ":" .. master_id .. ":" .. agent_id][ARGV[2]] =
  --       detail_obj["agent"][manager_id .. ":" .. smaster_id .. ":" .. master_id .. ":" .. agent_id][ARGV[2]] +
  --       tonumber(win_price)
  --   else
  --     detail_obj["agent"][manager_id .. ":" .. smaster_id .. ":" .. master_id .. ":" .. agent_id][ARGV[2]] =
  --       tonumber(win_price)
  --   end
  -- end

end
return {count, tostring(total_price), tostring(total_win_price), cjson.encode(detail_obj)}
