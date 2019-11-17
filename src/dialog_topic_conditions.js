const topic_conditions = [
	{
		"condition": "u_male",
		"datatype": "boolean",
		"description": "true if the player character or NPC is male."
	},
	{
		"condition": "npc_male",
		"datatype": "boolean",
		"description": "true if the player character or NPC is male."
	},
	{
		"condition": "u_female",
		"datatype": "boolean",
		"description": "true if the player character or NPC is female."
	},
	{
		"condition": "npc_female",
		"datatype": "boolean",
		"description": "true if the player character or NPC is female."
	},
	{
		"condition": "u_at_om_location",
		"datatype": "string",
		"description": "true if the player character or NPC is standing on an overmap tile with u_at_om_location's id. The special string 'FACTION_CAMP_ANY' changes it to return true if the player or NPC is standing on a faction camp overmap tile. The special string 'FACTION_CAMP_START' changes it to return true if the overmap tile that the player or NPC is standing on can be turned into a faction camp overmap tile."
	},
	{
		"condition": "npc_at_om_location",
		"datatype": "string",
		"description": "true if the player character or NPC is standing on an overmap tile with u_at_om_location's id. The special string 'FACTION_CAMP_ANY' changes it to return true if the player or NPC is standing on a faction camp overmap tile. The special string 'FACTION_CAMP_START' changes it to return true if the overmap tile that the player or NPC is standing on can be turned into a faction camp overmap tile."
	},
	{
		"condition": "u_has_trait",
		"datatype": "string",
		"description": "true if the player character or NPC has a specific trait. Simpler versions of u_has_any_trait and npc_has_any_trait that only checks for one trait."
	},
	{
		"condition": "npc_has_trait",
		"datatype": "string",
		"description": "true if the player character or NPC has a specific trait. Simpler versions of u_has_any_trait and npc_has_any_trait that only checks for one trait."
	},
	{
		"condition": "u_has_trait_flag",
		"datatype": "string",
		"description": "true if the player character or NPC has any traits with the specific trait flag. More robust versions of u_has_any_trait and npc_has_any_trait. The special trait flag 'MUTATION_THRESHOLD' checks to see if the player or NPC has crossed a mutation threshold."
	},
	{
		"condition": "npc_has_trait_flag",
		"datatype": "string",
		"description": "true if the player character or NPC has any traits with the specific trait flag. More robust versions of u_has_any_trait and npc_has_any_trait. The special trait flag 'MUTATION_THRESHOLD' checks to see if the player or NPC has crossed a mutation threshold."
	},
	{
		"condition": "u_has_any_trait",
		"datatype": "array",
		"description": "true if the player character or NPC has any trait or mutation in the array. Used to check multiple specific traits."
	},
	{
		"condition": "npc_has_any_trait",
		"datatype": "array",
		"description": "true if the player character or NPC has any trait or mutation in the array. Used to check multiple specific traits."
	},
	{
		"condition": "u_has_var",
		"datatype": "string",
		"description": "'type': type_str, 'context': context_str, and 'value': value_str are required fields in the same dictionary as 'u_has_var' or 'npc_has_var'.true is the player character or NPC has a variable set by 'u_add_var' or 'npc_add_var' with the string, type_str, context_str, and value_str."
	},
	{
		"condition": "npc_has_var",
		"datatype": "string",
		"description": "'type': type_str, 'context': context_str, and 'value': value_str are required fields in the same dictionary as 'u_has_var' or 'npc_has_var'.true is the player character or NPC has a variable set by 'u_add_var' or 'npc_add_var' with the string, type_str, context_str, and value_str."
	},
	{
		"condition": "u_compare_var",
		"datatype": "dictionary",
		"description": "'type': type_str, 'context': context_str, 'op': op_str, 'value': value_num are required fields, referencing a var as in 'u_add_var' or 'npc_add_var'.true if the player character or NPC has a stored variable that is true for the provided operator op_str (one of ==, !=, <, >, <=, >=) and value."
	},
	{
		"condition": "npc_compare_var",
		"datatype": "dictionary",
		"description": "'type': type_str, 'context': context_str, 'op': op_str, 'value': value_num are required fields, referencing a var as in 'u_add_var' or 'npc_add_var'.true if the player character or NPC has a stored variable that is true for the provided operator op_str (one of ==, !=, <, >, <=, >=) and value."
	},
	{
		"condition": "u_has_strength",
		"datatype": "int",
		"description": "true if the player character's or NPC's strength is at least the value of u_has_strength or npc_has_strength."
	},
	{
		"condition": "npc_has_strength",
		"datatype": "int",
		"description": "true if the player character's or NPC's strength is at least the value of u_has_strength or npc_has_strength."
	},
	{
		"condition": "u_has_dexterity",
		"datatype": "int",
		"description": "true if the player character's or NPC's dexterity is at least the value of u_has_dexterity or npc_has_dexterity."
	},
	{
		"condition": "npc_has_dexterity",
		"datatype": "int",
		"description": "true if the player character's or NPC's dexterity is at least the value of u_has_dexterity or npc_has_dexterity."
	},
	{
		"condition": "u_has_intelligence",
		"datatype": "int",
		"description": "true if the player character's or NPC's intelligence is at least the value of u_has_intelligence or npc_has_intelligence."
	},
	{
		"condition": "npc_has_intelligence",
		"datatype": "int",
		"description": "true if the player character's or NPC's intelligence is at least the value of u_has_intelligence or npc_has_intelligence."
	},
	{
		"condition": "u_has_perception",
		"datatype": "int",
		"description": "true if the player character's or NPC's perception is at least the value of u_has_perception or npc_has_perception."
	},
	{
		"condition": "npc_has_perception",
		"datatype": "int",
		"description": "true if the player character's or NPC's perception is at least the value of u_has_perception or npc_has_perception."
	},
	{
		"condition": "u_is_wearing",
		"datatype": "string",
		"description": "true if the player character wears something with item_id in their inventory."
	},
	{
		"condition": "u_has_item",
		"datatype": "string",
		"description": "true if the player character or NPC has something with u_has_item's or npc_has_item's item_id in their inventory."
	},
	{
		"condition": "npc_has_item",
		"datatype": "string",
		"description": "true if the player character or NPC has something with u_has_item's or npc_has_item's item_id in their inventory."
	},
	{
		"condition": "u_has_items",
		"datatype": "dictionary",
		"description": "u_has_items or npc_has_items must be a dictionary with an item string and a count int. true if the player character or NPC has at least count charges or counts of item in their inventory."
	},
	{
		"condition": "npc_has_item",
		"datatype": "dictionary",
		"description": "u_has_items or npc_has_items must be a dictionary with an item string and a count int. true if the player character or NPC has at least count charges or counts of item in their inventory."
	},
	{
		"condition": "u_has_item_category",
		"datatype": "string",
		"description": "'count': item_count is an optional field that must be in the same dictionary and defaults to 1 if not specified. true if the player or NPC has item_count items with the same category as u_has_item_category or npc_has_item_category."
	},
	{
		"condition": "npc_has_item_category",
		"datatype": "string",
		"description": "'count': item_count is an optional field that must be in the same dictionary and defaults to 1 if not specified. true if the player or NPC has item_count items with the same category as u_has_item_category or npc_has_item_category."
	},
	{
		"condition": "u_has_bionics",
		"datatype": "string",
		"description": "true if the player or NPC has an installed bionic with an bionic_id matching 'u_has_bionics' or 'npc_has_bionics'. The special string 'ANY' returns true if the player or NPC has any installed bionics."
	},
	{
		"condition": "npc_has_bionics",
		"datatype": "string",
		"description": "true if the player or NPC has an installed bionic with an bionic_id matching 'u_has_bionics' or 'npc_has_bionics'. The special string 'ANY' returns true if the player or NPC has any installed bionics."
	},
	{
		"condition": "u_has_effect",
		"datatype": "string",
		"description": "true if the player character or NPC is under the effect with u_has_effect or npc_has_effect's effect_id."
	},
	{
		"condition": "npc_has_effect",
		"datatype": "string",
		"description": "true if the player character or NPC is under the effect with u_has_effect or npc_has_effect's effect_id."
	},
	{
		"condition": "u_can_stow_weapon",
		"datatype": "boolean",
		"description": "true if the player character or NPC is wielding a weapon and has enough space to put it away."
	},
	{
		"condition": "npc_can_stow_weapon",
		"datatype": "boolean",
		"description": "true if the player character or NPC is wielding a weapon and has enough space to put it away."
	},
	{
		"condition": "u_has_weapon",
		"datatype": "boolean",
		"description": "true if the player character or NPC is wielding a weapon."
	},
	{
		"condition": "npc_has_weapon",
		"datatype": "boolean",
		"description": "true if the player character or NPC is wielding a weapon."
	},
	{
		"condition": "u_driving",
		"datatype": "boolean",
		"description": "true if the player character or NPC is operating a vehicle. Note NPCs cannot currently operate vehicles."
	},
	{
		"condition": "npc_driving",
		"datatype": "boolean",
		"description": "true if the player character or NPC is operating a vehicle. Note NPCs cannot currently operate vehicles."
	},
	{
		"condition": "u_has_skill",
		"datatype": "dictionary",
		"description": "u_has_skill or npc_has_skill must be a dictionary with a skill string and a level int. true if the player character or NPC has at least the value of level in skill."
	},
	{
		"condition": "npc_has_skill",
		"datatype": "dictionary",
		"description": "u_has_skill or npc_has_skill must be a dictionary with a skill string and a level int. true if the player character or NPC has at least the value of level in skill."
	},
	{
		"condition": "u_know_recipe",
		"datatype": "string",
		"description": "true if the player character knows the recipe specified in u_know_recipe. It only counts as known if it is actually memorized--holding a book with the recipe in it will not count."
	},
	{
		"condition": "u_has_mission",
		"datatype": "string",
		"description": "true if the mission is assigned to the player character. "
	},
	{
		"condition": "u_has_cash",
		"datatype": "int",
		"description": "true if the player character has at least u_has_cash cash available. Deprecated Previously used to check if the player could buy something, but NPCs shouldn't use e-cash for trades anymore. "
	},
	{
		"condition": "u_are_owed",
		"datatype": "int",
		"description": "true if the NPC's op_of_u.owed is at least u_are_owed. Can be used to check if the player can buy something from the NPC without needing to barter anything. "
	},
	{
		"condition": "u_has_camp",
		"datatype": "boolean",
		"description": "true is the player has one or more active base camps."
	},
	{
		"condition": "at_safe_space",
		"datatype": "boolean",
		"description": "true if the NPC's current overmap location passes the is_safe() test."
	},
	{
		"condition": "has_assigned_mission",
		"datatype": "boolean",
		"description": "true if the player character has exactly one mission from the NPC. Can be used for texts like 'About that job...'."
	},
	{
		"condition": "has_many_assigned_missions",
		"datatype": "boolean",
		"description": "true if the player character has several mission from the NPC (more than one). Can be used for texts like 'About one of those jobs...' and to switch to the 'TALK_MISSION_LIST_ASSIGNED' topic."
	},
	{
		"condition": "has_no_available_mission",
		"datatype": "boolean",
		"description": "true if the NPC has no jobs available for the player character."
	},
	{
		"condition": "has_available_mission",
		"datatype": "boolean",
		"description": "true if the NPC has one job available for the player character."
	},
	{
		"condition": "has_many_available_missions",
		"datatype": "boolean",
		"description": "true if the NPC has several jobs available for the player character."
	},
	{
		"condition": "mission_goal",
		"datatype": "string",
		"description": "true if the NPC's current mission has the same goal as mission_goal."
	},
	{
		"condition": "mission_complete",
		"datatype": "boolean",
		"description": "true if the player has completed the NPC's current mission."
	},
	{
		"condition": "mission_incomplete",
		"datatype": "boolean",
		"description": "true if the player hasn't completed the NPC's current mission."
	},
	{
		"condition": "has_no_assigned_mission",
		"datatype": "boolean",
		"description": "true if the player does not have an assigned mission."
	},
	{
		"condition": "mission_has_generic_rewards",
		"datatype": "boolean",
		"description": "true if the NPC's current mission is flagged as having generic rewards."
	},
	{
		"condition": "npc_service",
		"datatype": "int",
		"description": "true if the NPC does not have the 'currently_busy' effect and the player character has at least npc_service cash available. Useful to check if the player character can hire an NPC to perform a task that would take time to complete. Functionally, this is identical to 'and': [ { 'not': { 'npc_has_effect': 'currently_busy' } }, { 'u_has_cash': service_cost } ]"
	},
	{
		"condition": "npc_allies",
		"datatype": "int",
		"description": "true if the player character has at least npc_allies number of NPC allies."
	},
	{
		"condition": "npc_following",
		"datatype": "boolean",
		"description": "true if the NPC is following the player character."
	},
	{
		"condition": "is_by_radio",
		"datatype": "boolean",
		"description": "true if the player is talking to the NPC over a radio."
	},
	{
		"condition": "npc_available",
		"datatype": "boolean",
		"description": "true if the NPC does not have effect 'currently_busy'."
	},
	{
		"condition": "npc_following",
		"datatype": "boolean",
		"description": "true if the NPC is following the player character."
	},
	{
		"condition": "npc_friend",
		"datatype": "boolean",
		"description": "true if the NPC is friendly to the player character."
	},
	{
		"condition": "npc_hostile",
		"datatype": "boolean",
		"description": "true if the NPC is an enemy of the player character."
	},
	{
		"condition": "npc_train_skills",
		"datatype": "boolean",
		"description": "true if the NPC has one or more skills with more levels than the player."
	},
	{
		"condition": "npc_train_styles",
		"datatype": "boolean",
		"description": "true if the NPC knows one or more martial arts styles that the player does not know."
	},
	{
		"condition": "npc_has_class",
		"datatype": "array",
		"description": "true if the NPC is a member of an NPC class."
	},
	{
		"condition": "npc_role_nearby",
		"datatype": "boolean",
		"description": "true if there is an NPC with the same companion mission role as npc_role_nearby within 100 tiles."
	},
	{
		"condition": "has_reason",
		"datatype": "boolean",
		"description": "true if a previous effect set a reason for why an effect could not be completed."
	},
	{
		"condition": "npc_aim_rule",
		"datatype": "string",
		"description": "true if the NPC follower AI rule for aiming matches the string."
	},
	{
		"condition": "npc_engagement_rule",
		"datatype": "string",
		"description": "true if the NPC follower AI rule for engagement matches the string."
	},
	{
		"condition": "npc_rule",
		"datatype": "string",
		"description": "true if the NPC follower AI rule for that matches string is set."
	},
	{
		"condition": "days_since_cataclysm",
		"datatype": "int",
		"description": "true if at least days_since_cataclysm days have passed since the Cataclysm."
	},
	{
		"condition": "is_season",
		"datatype": "string",
		"description": "true if the current season matches is_season, which must be one of 'spring', 'summer', 'autumn', or 'winter'."
	},
	{
		"condition": "is_day",
		"datatype": "boolean",
		"description": "true if it is currently daytime."
	},
	{
		"condition": "is_outside",
		"datatype": "boolean",
		"description": "true if the NPC is on a tile without a roof."
	}
]