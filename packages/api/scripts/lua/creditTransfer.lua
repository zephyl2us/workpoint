local temp_action_balance = redis.call("HGET", KEYS[1], ARGV[1])

if not temp_action_balance then
    return {"donot_have_wallet", false, false}
end

temp_action_balance = tonumber(temp_action_balance)
local temp_action_balance = (temp_action_balance - tonumber(ARGV[3]))

if temp_action_balance < 0 then
    return {"credit_exceed", false, false}
end

local action_balance = redis.call("HINCRBYFLOAT", KEYS[1], ARGV[1], (tonumber(ARGV[3]) * -1))
local target_balance = redis.call("HINCRBYFLOAT", KEYS[2], ARGV[2], tonumber(ARGV[3]))

return {"success", tostring(action_balance), tostring(target_balance)}
